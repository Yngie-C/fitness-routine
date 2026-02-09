'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface WorkoutSession {
  id: string;
  routine_id: string | null;
  completed_at: string;
  duration_seconds: number | null;
  total_volume: string | null;
  routine?: {
    name: string;
  };
}

export function RecentWorkouts() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('/api/v1/sessions?limit=5');
        if (response.ok) {
          const result = await response.json();
          setSessions(result.sessions || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent workouts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 운동 기록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 운동 기록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              아직 운동 기록이 없어요
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 운동 기록</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((session, index) => {
          const duration = session.duration_seconds
            ? Math.round(session.duration_seconds / 60)
            : 0;
          const volume = session.total_volume
            ? Math.round(parseFloat(session.total_volume))
            : 0;
          const timeAgo = formatDistanceToNow(new Date(session.completed_at), {
            addSuffix: true,
            locale: ko,
          });

          return (
            <div key={session.id}>
              {index > 0 && <Separator className="my-3" />}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {session.routine?.name || '운동 세션'}
                  </span>
                  <span className="text-xs text-muted-foreground">{timeAgo}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {duration > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{duration}분</span>
                    </div>
                  )}
                  {volume > 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{volume.toLocaleString()}kg</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
