'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Routine {
  id: string;
  name: string;
  exercises?: any[];
}

export function TodayRoutine() {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutine() {
      try {
        const response = await fetch('/api/v1/routines?include_exercises=true');
        if (response.ok) {
          const result = await response.json();
          // Get the first routine (most recently used or first created)
          if (result.routines && result.routines.length > 0) {
            setRoutine(result.routines[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch routine:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutine();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>오늘의 루틴</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!routine) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>오늘의 루틴</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              루틴을 만들어보세요
            </p>
            <Link href="/routines/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                루틴 만들기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const exerciseCount = routine.exercises?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>오늘의 루틴</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{routine.name}</h3>
          <p className="text-sm text-muted-foreground">
            {exerciseCount}개의 운동
          </p>
        </div>
        <Link href="/workout">
          <Button className="w-full">
            <Dumbbell className="h-4 w-4 mr-2" />
            운동 시작
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
