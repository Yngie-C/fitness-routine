import { v4 as uuidv4 } from 'uuid';
import { offlineDb, type LocalWorkoutSession, type LocalWorkoutSet } from './db';
import { addToSyncQueue } from './sync-manager';

export async function saveSessionLocally(
  session: Omit<LocalWorkoutSession, 'client_id' | 'sync_status' | 'client_updated_at'>
): Promise<LocalWorkoutSession> {
  const clientId = uuidv4();
  const now = new Date().toISOString();

  const localSession: LocalWorkoutSession = {
    ...session,
    client_id: clientId,
    sync_status: 'pending',
    client_updated_at: now,
  };

  await offlineDb.workoutSessions.add(localSession);

  // Add to sync queue
  await addToSyncQueue('workout_sessions', 'create', clientId, localSession as unknown as Record<string, unknown>);

  return localSession;
}

export async function saveSetLocally(
  set: Omit<LocalWorkoutSet, 'client_id' | 'sync_status' | 'client_updated_at'>
): Promise<LocalWorkoutSet> {
  const clientId = uuidv4();
  const now = new Date().toISOString();

  const localSet: LocalWorkoutSet = {
    ...set,
    client_id: clientId,
    sync_status: 'pending',
    client_updated_at: now,
  };

  await offlineDb.workoutSets.add(localSet);

  // Add to sync queue
  await addToSyncQueue('workout_sets', 'create', clientId, localSet as unknown as Record<string, unknown>);

  return localSet;
}

export async function getLocalSessions(): Promise<LocalWorkoutSession[]> {
  return await offlineDb.workoutSessions.orderBy('started_at').reverse().toArray();
}

export async function getLocalSessionWithSets(
  clientId: string
): Promise<{ session: LocalWorkoutSession; sets: LocalWorkoutSet[] } | null> {
  const session = await offlineDb.workoutSessions.get(clientId);
  if (!session) return null;

  const sets = await offlineDb.workoutSets
    .where('session_client_id')
    .equals(clientId)
    .sortBy('set_number');

  return { session, sets };
}

export async function updateLocalSession(
  clientId: string,
  updates: Partial<Omit<LocalWorkoutSession, 'client_id'>>
): Promise<void> {
  const now = new Date().toISOString();

  await offlineDb.workoutSessions.update(clientId, {
    ...updates,
    sync_status: 'pending',
    client_updated_at: now,
  });

  // Get updated session for sync queue
  const session = await offlineDb.workoutSessions.get(clientId);
  if (session) {
    await addToSyncQueue('workout_sessions', 'update', clientId, session as unknown as Record<string, unknown>);
  }
}

export async function deleteLocalSession(clientId: string): Promise<void> {
  const session = await offlineDb.workoutSessions.get(clientId);
  if (!session) return;

  await offlineDb.workoutSessions.delete(clientId);

  // Delete associated sets
  const sets = await offlineDb.workoutSets.where('session_client_id').equals(clientId).toArray();
  await offlineDb.workoutSets.bulkDelete(sets.map((s) => s.client_id));

  // Add to sync queue
  await addToSyncQueue('workout_sessions', 'delete', clientId, session as unknown as Record<string, unknown>);
}
