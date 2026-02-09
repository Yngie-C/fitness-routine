import { offlineDb, type SyncQueueItem } from './db';

const SYNC_TIMESTAMP_KEY = 'last_sync_timestamp';
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000; // 1 second

export interface SyncChange {
  table_name: 'workout_sessions' | 'workout_sets';
  operation: 'create' | 'update' | 'delete';
  client_id: string;
  data: Record<string, unknown>;
  client_updated_at: string;
}

export interface SyncResult {
  client_id: string;
  success: boolean;
  server_id?: string;
  error?: string;
  conflict?: boolean;
}

export interface ServerChange {
  table_name: 'workout_sessions' | 'workout_sets';
  operation: 'create' | 'update' | 'delete';
  server_id: string;
  client_id?: string;
  data: Record<string, unknown>;
  updated_at: string;
}

export async function addToSyncQueue(
  tableName: 'workout_sessions' | 'workout_sets',
  operation: 'create' | 'update' | 'delete',
  recordClientId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const item: SyncQueueItem = {
    table_name: tableName,
    operation,
    record_client_id: recordClientId,
    payload,
    status: 'pending',
    retry_count: 0,
    max_retries: MAX_RETRIES,
    created_at: new Date().toISOString(),
  };

  await offlineDb.syncQueue.add(item);
}

export async function processSyncQueue(): Promise<void> {
  const pendingItems = await offlineDb.syncQueue
    .where('status')
    .equals('pending')
    .sortBy('id');

  if (pendingItems.length === 0) {
    return;
  }

  // Mark items as in_progress
  for (const item of pendingItems) {
    await offlineDb.syncQueue.update(item.id!, {
      status: 'in_progress',
      last_attempted_at: new Date().toISOString(),
    });
  }

  // Prepare changes for batch push
  const changes: SyncChange[] = pendingItems.map((item) => ({
    table_name: item.table_name,
    operation: item.operation,
    client_id: item.record_client_id,
    data: item.payload,
    client_updated_at: item.payload.client_updated_at as string,
  }));

  try {
    const response = await fetch('/api/v1/sync/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes }),
    });

    if (!response.ok) {
      throw new Error(`Sync push failed: ${response.status}`);
    }

    const result = await response.json();
    const results: SyncResult[] = result.results;

    // Process results
    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      const syncResult = results[i];

      if (syncResult.success) {
        // Update IndexedDB record with server_id
        if (syncResult.server_id) {
          if (item.table_name === 'workout_sessions') {
            await offlineDb.workoutSessions.update(item.record_client_id, {
              server_id: syncResult.server_id,
              sync_status: 'synced',
            });
          } else if (item.table_name === 'workout_sets') {
            await offlineDb.workoutSets.update(item.record_client_id, {
              server_id: syncResult.server_id,
              sync_status: 'synced',
            });
          }
        }

        // Mark queue item as completed
        await offlineDb.syncQueue.update(item.id!, { status: 'completed' });
      } else {
        // Handle failure with retry logic
        const newRetryCount = item.retry_count + 1;

        if (newRetryCount >= MAX_RETRIES) {
          await offlineDb.syncQueue.update(item.id!, {
            status: 'failed',
            error_message: syncResult.error || 'Max retries exceeded',
          });
        } else {
          // Schedule retry with exponential backoff
          const backoffMs = BASE_BACKOFF_MS * Math.pow(4, newRetryCount);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));

          await offlineDb.syncQueue.update(item.id!, {
            status: 'pending',
            retry_count: newRetryCount,
            error_message: syncResult.error,
          });
        }
      }
    }

    // Update last sync timestamp
    if (result.server_timestamp) {
      setLastSyncTimestamp(result.server_timestamp);
    }
  } catch (error) {
    // Handle network errors - mark all as pending for retry
    for (const item of pendingItems) {
      const newRetryCount = item.retry_count + 1;

      if (newRetryCount >= MAX_RETRIES) {
        await offlineDb.syncQueue.update(item.id!, {
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      } else {
        await offlineDb.syncQueue.update(item.id!, {
          status: 'pending',
          retry_count: newRetryCount,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    throw error;
  }
}

export async function pullFromServer(): Promise<void> {
  const lastSync = getLastSyncTimestamp();
  const url = lastSync ? `/api/v1/sync/pull?since=${lastSync}` : '/api/v1/sync/pull';

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Sync pull failed: ${response.status}`);
    }

    const result = await response.json();
    const changes: ServerChange[] = result.changes || [];

    // Apply server changes to IndexedDB
    for (const change of changes) {
      if (change.table_name === 'workout_sessions') {
        if (change.operation === 'create' || change.operation === 'update') {
          const existing = change.client_id
            ? await offlineDb.workoutSessions.get(change.client_id)
            : await offlineDb.workoutSessions.where('server_id').equals(change.server_id).first();

          if (existing) {
            // Check for conflict (LWW)
            const serverTime = new Date(change.updated_at).getTime();
            const clientTime = new Date(existing.client_updated_at).getTime();

            if (serverTime >= clientTime) {
              await offlineDb.workoutSessions.update(existing.client_id, {
                ...change.data,
                server_id: change.server_id,
                sync_status: 'synced',
              });
            }
          } else {
            // New record from server
            await offlineDb.workoutSessions.add({
              ...(change.data as Partial<typeof offlineDb.workoutSessions>),
              client_id: change.client_id || change.server_id,
              server_id: change.server_id,
              sync_status: 'synced',
            } as any);
          }
        } else if (change.operation === 'delete') {
          const existing = change.client_id
            ? await offlineDb.workoutSessions.get(change.client_id)
            : await offlineDb.workoutSessions.where('server_id').equals(change.server_id).first();

          if (existing) {
            await offlineDb.workoutSessions.delete(existing.client_id);
          }
        }
      } else if (change.table_name === 'workout_sets') {
        if (change.operation === 'create' || change.operation === 'update') {
          const existing = change.client_id
            ? await offlineDb.workoutSets.get(change.client_id)
            : await offlineDb.workoutSets.where('server_id').equals(change.server_id).first();

          if (existing) {
            // Check for conflict (LWW)
            const serverTime = new Date(change.updated_at).getTime();
            const clientTime = new Date(existing.client_updated_at).getTime();

            if (serverTime >= clientTime) {
              await offlineDb.workoutSets.update(existing.client_id, {
                ...change.data,
                server_id: change.server_id,
                sync_status: 'synced',
              });
            }
          } else {
            // New record from server
            await offlineDb.workoutSets.add({
              ...(change.data as Partial<typeof offlineDb.workoutSets>),
              client_id: change.client_id || change.server_id,
              server_id: change.server_id,
              sync_status: 'synced',
            } as any);
          }
        } else if (change.operation === 'delete') {
          const existing = change.client_id
            ? await offlineDb.workoutSets.get(change.client_id)
            : await offlineDb.workoutSets.where('server_id').equals(change.server_id).first();

          if (existing) {
            await offlineDb.workoutSets.delete(existing.client_id);
          }
        }
      }
    }

    // Update last sync timestamp
    if (result.server_timestamp) {
      setLastSyncTimestamp(result.server_timestamp);
    }
  } catch (error) {
    throw error;
  }
}

export function getLastSyncTimestamp(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SYNC_TIMESTAMP_KEY);
}

export function setLastSyncTimestamp(timestamp: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SYNC_TIMESTAMP_KEY, timestamp);
}

export async function getPendingCount(): Promise<number> {
  const count = await offlineDb.syncQueue.where('status').equals('pending').count();
  return count;
}
