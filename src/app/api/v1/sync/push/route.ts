import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SyncChange, SyncResult } from '@/lib/offline/sync-manager';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { changes } = await request.json();

    if (!Array.isArray(changes)) {
      return NextResponse.json({ error: 'Invalid changes format' }, { status: 400 });
    }

    const results: SyncResult[] = [];
    const serverTimestamp = new Date().toISOString();

    for (const change of changes as SyncChange[]) {
      try {
        if (change.table_name === 'workout_sessions') {
          if (change.operation === 'create') {
            // Check if record already exists (by client_id or server_id)
            const { data: existing } = await supabase
              .from('workout_sessions')
              .select('id, updated_at')
              .or(`id.eq.${change.data.server_id},metadata->>client_id.eq.${change.client_id}`)
              .single();

            if (existing) {
              // Conflict detection: LWW (Last Write Wins)
              const serverTime = new Date(existing.updated_at).getTime();
              const clientTime = new Date(change.client_updated_at).getTime();

              if (clientTime > serverTime) {
                // Client wins - update server
                const { data, error } = await supabase
                  .from('workout_sessions')
                  .update({
                    ...change.data,
                    user_id: user.id,
                    metadata: { client_id: change.client_id },
                    updated_at: serverTimestamp,
                  })
                  .eq('id', existing.id)
                  .select('id')
                  .single();

                if (error) throw error;

                results.push({
                  client_id: change.client_id,
                  success: true,
                  server_id: data.id,
                });
              } else {
                // Server wins - conflict
                results.push({
                  client_id: change.client_id,
                  success: false,
                  conflict: true,
                  error: 'Server version is newer',
                });
              }
            } else {
              // New record
              const { data, error } = await supabase
                .from('workout_sessions')
                .insert({
                  ...change.data,
                  user_id: user.id,
                  metadata: { client_id: change.client_id },
                  created_at: change.data.started_at as string,
                  updated_at: serverTimestamp,
                })
                .select('id')
                .single();

              if (error) throw error;

              results.push({
                client_id: change.client_id,
                success: true,
                server_id: data.id,
              });
            }
          } else if (change.operation === 'update') {
            // Find record
            const { data: existing } = await supabase
              .from('workout_sessions')
              .select('id, updated_at')
              .or(`id.eq.${change.data.server_id},metadata->>client_id.eq.${change.client_id}`)
              .single();

            if (!existing) {
              results.push({
                client_id: change.client_id,
                success: false,
                error: 'Record not found',
              });
              continue;
            }

            // Conflict detection: LWW
            const serverTime = new Date(existing.updated_at).getTime();
            const clientTime = new Date(change.client_updated_at).getTime();

            if (clientTime > serverTime) {
              const { data, error } = await supabase
                .from('workout_sessions')
                .update({
                  ...change.data,
                  updated_at: serverTimestamp,
                })
                .eq('id', existing.id)
                .select('id')
                .single();

              if (error) throw error;

              results.push({
                client_id: change.client_id,
                success: true,
                server_id: data.id,
              });
            } else {
              results.push({
                client_id: change.client_id,
                success: false,
                conflict: true,
                error: 'Server version is newer',
              });
            }
          } else if (change.operation === 'delete') {
            const { error } = await supabase
              .from('workout_sessions')
              .delete()
              .or(`id.eq.${change.data.server_id},metadata->>client_id.eq.${change.client_id}`);

            if (error) throw error;

            results.push({
              client_id: change.client_id,
              success: true,
            });
          }
        } else if (change.table_name === 'workout_sets') {
          if (change.operation === 'create') {
            // Check if record already exists
            const { data: existing } = await supabase
              .from('workout_sets')
              .select('id, updated_at')
              .or(`id.eq.${change.data.server_id},metadata->>client_id.eq.${change.client_id}`)
              .single();

            if (existing) {
              // Conflict detection: LWW
              const serverTime = new Date(existing.updated_at).getTime();
              const clientTime = new Date(change.client_updated_at).getTime();

              if (clientTime > serverTime) {
                const { data, error } = await supabase
                  .from('workout_sets')
                  .update({
                    ...change.data,
                    metadata: { client_id: change.client_id },
                    updated_at: serverTimestamp,
                  })
                  .eq('id', existing.id)
                  .select('id')
                  .single();

                if (error) throw error;

                results.push({
                  client_id: change.client_id,
                  success: true,
                  server_id: data.id,
                });
              } else {
                results.push({
                  client_id: change.client_id,
                  success: false,
                  conflict: true,
                  error: 'Server version is newer',
                });
              }
            } else {
              // New record
              const { data, error } = await supabase
                .from('workout_sets')
                .insert({
                  ...change.data,
                  metadata: { client_id: change.client_id },
                  created_at: change.data.completed_at as string,
                  updated_at: serverTimestamp,
                })
                .select('id')
                .single();

              if (error) throw error;

              results.push({
                client_id: change.client_id,
                success: true,
                server_id: data.id,
              });
            }
          } else if (change.operation === 'update') {
            const { data: existing } = await supabase
              .from('workout_sets')
              .select('id, updated_at')
              .or(`id.eq.${change.data.server_id},metadata->>client_id.eq.${change.client_id}`)
              .single();

            if (!existing) {
              results.push({
                client_id: change.client_id,
                success: false,
                error: 'Record not found',
              });
              continue;
            }

            // Conflict detection: LWW
            const serverTime = new Date(existing.updated_at).getTime();
            const clientTime = new Date(change.client_updated_at).getTime();

            if (clientTime > serverTime) {
              const { data, error } = await supabase
                .from('workout_sets')
                .update({
                  ...change.data,
                  updated_at: serverTimestamp,
                })
                .eq('id', existing.id)
                .select('id')
                .single();

              if (error) throw error;

              results.push({
                client_id: change.client_id,
                success: true,
                server_id: data.id,
              });
            } else {
              results.push({
                client_id: change.client_id,
                success: false,
                conflict: true,
                error: 'Server version is newer',
              });
            }
          } else if (change.operation === 'delete') {
            const { error } = await supabase
              .from('workout_sets')
              .delete()
              .or(`id.eq.${change.data.server_id},metadata->>client_id.eq.${change.client_id}`);

            if (error) throw error;

            results.push({
              client_id: change.client_id,
              success: true,
            });
          }
        }
      } catch (error) {
        console.error('Error processing change:', error);
        results.push({
          client_id: change.client_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({ results, server_timestamp: serverTimestamp });
  } catch (error) {
    console.error('Sync push error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
