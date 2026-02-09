import Dexie, { type Table } from 'dexie';

export interface LocalWorkoutSession {
  client_id: string;
  server_id?: string;
  routine_id?: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  total_volume?: number;
  notes?: string;
  workout_date?: string;
  session_type?: 'realtime' | 'manual';
  sync_status: 'pending' | 'synced' | 'conflict';
  client_updated_at: string;
}

export interface LocalWorkoutSet {
  client_id: string;
  server_id?: string;
  session_client_id: string;
  exercise_id: string;
  set_number: number;
  weight?: number;
  reps: number;
  is_warmup: boolean;
  is_pr: boolean;
  rpe?: number;
  sync_status: 'pending' | 'synced' | 'conflict';
  client_updated_at: string;
  completed_at: string;
}

export interface SyncQueueItem {
  id?: number;
  table_name: 'workout_sessions' | 'workout_sets';
  operation: 'create' | 'update' | 'delete';
  record_client_id: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'in_progress' | 'failed' | 'completed';
  retry_count: number;
  max_retries: number;
  created_at: string;
  last_attempted_at?: string;
  error_message?: string;
}

class FitnessDatabase extends Dexie {
  workoutSessions!: Table<LocalWorkoutSession, string>;
  workoutSets!: Table<LocalWorkoutSet, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('FitnessDB');
    this.version(1).stores({
      workoutSessions: 'client_id, server_id, sync_status, started_at',
      workoutSets: 'client_id, server_id, session_client_id, sync_status',
      syncQueue: '++id, status, table_name, record_client_id',
    });
    this.version(2).stores({
      workoutSessions: 'client_id, server_id, sync_status, started_at, workout_date, session_type',
      workoutSets: 'client_id, server_id, session_client_id, sync_status',
      syncQueue: '++id, status, table_name, record_client_id',
    });
  }
}

export const offlineDb = new FitnessDatabase();
