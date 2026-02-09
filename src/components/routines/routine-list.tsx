'use client';

import { useState, useEffect } from 'react';
import { RoutineCard } from './routine-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ListChecks } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RoutineListProps {
  initialRoutines?: any[];
}

export function RoutineList({ initialRoutines }: RoutineListProps) {
  const router = useRouter();
  const [routines, setRoutines] = useState(initialRoutines || []);
  const [isLoading, setIsLoading] = useState(!initialRoutines);

  useEffect(() => {
    if (!initialRoutines) {
      fetchRoutines();
    }
  }, []);

  const fetchRoutines = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/routines?include_exercises=true');
      if (!response.ok) {
        throw new Error('루틴 목록을 불러오는데 실패했습니다');
      }
      const data = await response.json();
      setRoutines(data.routines || []);
    } catch (error) {
      console.error('Fetch routines error:', error);
      toast.error(error instanceof Error ? error.message : '루틴 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    fetchRoutines();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <ListChecks className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">루틴이 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            나만의 루틴을 만들어보세요!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push('/routines/new')}>
              <Plus className="h-4 w-4 mr-2" />
              새 루틴 만들기
            </Button>
            <Button variant="outline" onClick={() => router.push('/routines/templates')}>
              템플릿 둘러보기
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {routines.map((routine) => (
        <RoutineCard key={routine.id} routine={routine} onDelete={handleDelete} />
      ))}
    </div>
  );
}
