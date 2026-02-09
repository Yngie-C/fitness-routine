import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ServerChange } from '@/lib/offline/sync-manager';

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const since = searchParams.get('since');

    const changes: ServerChange[] = [];
    const serverTimestamp = new Date().toISOString();

    // Fetch workout sessions
    let sessionsQuery = supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (since) {
      sessionsQuery = sessionsQuery.gt('updated_at', since);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;

    if (sessionsError) {
      throw sessionsError;
    }

    if (sessions) {
      for (const session of sessions) {
        changes.push({
          table_name: 'workout_sessions',
          operation: 'create', // We treat everything as create/update for simplicity
          server_id: session.id,
          client_id: session.metadata?.client_id,
          data: {
            routine_id: session.routine_id,
            started_at: session.created_at,
            completed_at: session.completed_at,
            duration_seconds: session.duration_seconds,
            total_volume: session.total_volume,
            notes: session.notes,
          },
          updated_at: session.updated_at,
        });
      }
    }

    // Fetch workout sets
    let setsQuery = supabase
      .from('workout_sets')
      .select('*')
      .in(
        'session_id',
        sessions?.map((s) => s.id) || []
      )
      .order('updated_at', { ascending: false });

    if (since) {
      setsQuery = setsQuery.gt('updated_at', since);
    }

    const { data: sets, error: setsError } = await setsQuery;

    if (setsError) {
      throw setsError;
    }

    if (sets) {
      for (const set of sets) {
        // Find the session to get its client_id
        const session = sessions?.find((s) => s.id === set.session_id);
        const sessionClientId = session?.metadata?.client_id || set.session_id;

        changes.push({
          table_name: 'workout_sets',
          operation: 'create',
          server_id: set.id,
          client_id: set.metadata?.client_id,
          data: {
            session_client_id: sessionClientId,
            exercise_id: set.exercise_id,
            set_number: set.set_number,
            weight: set.weight,
            reps: set.reps,
            is_warmup: set.is_warmup,
            is_pr: set.is_pr,
            rpe: set.rpe,
            completed_at: set.created_at,
          },
          updated_at: set.updated_at,
        });
      }
    }

    return NextResponse.json({ changes, server_timestamp: serverTimestamp });
  } catch (error) {
    console.error('Sync pull error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
