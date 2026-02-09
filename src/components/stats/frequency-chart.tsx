'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface FrequencyData {
  period: string;
  count: number;
}

interface FrequencyChartProps {
  from: string;
  to: string;
  period?: 'weekly' | 'monthly';
}

export function FrequencyChart({ from, to, period = 'weekly' }: FrequencyChartProps) {
  const [data, setData] = useState<FrequencyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/v1/stats/frequency?period=${period}&from=${from}&to=${to}`
        );
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch frequency data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [from, to, period]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>운동 빈도</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>운동 빈도</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
            데이터가 없습니다
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    displayPeriod:
      period === 'weekly'
        ? format(parseISO(item.period), 'M/d', { locale: ko })
        : format(parseISO(item.period + '-01'), 'yyyy년 M월', { locale: ko }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>운동 빈도</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayPeriod"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
