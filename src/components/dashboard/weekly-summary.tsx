'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Flame, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WeeklySummaryData {
  total_sessions: number;
  total_volume: number;
  workout_days: number;
  streak: number;
}

export function WeeklySummary() {
  const [data, setData] = useState<WeeklySummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch('/api/v1/stats/summary');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch weekly summary:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>이번 주 운동</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const stats = [
    {
      label: '운동 횟수',
      value: data.total_sessions,
      unit: '회',
      icon: Activity,
      color: 'text-blue-600',
    },
    {
      label: '총 볼륨',
      value: data.total_volume.toLocaleString(),
      unit: 'kg',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      label: '스트릭',
      value: data.streak,
      unit: '일',
      icon: Flame,
      color: 'text-orange-600',
    },
    {
      label: '운동 일수',
      value: data.workout_days,
      unit: '일',
      icon: Clock,
      color: 'text-purple-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>이번 주 운동</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex flex-col space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <span>{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.unit}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
