'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FrequencyChart } from '@/components/stats/frequency-chart';
import { VolumeChart } from '@/components/stats/volume-chart';
import { subWeeks, subMonths, format, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function StatsPage() {
  const [period, setPeriod] = useState<'1week' | '1month' | '3months'>('1month');

  // Calculate date ranges based on selected period
  const getDateRange = () => {
    const now = new Date();
    const to = format(now, 'yyyy-MM-dd');
    let from: string;

    switch (period) {
      case '1week':
        from = format(subWeeks(now, 1), 'yyyy-MM-dd');
        break;
      case '1month':
        from = format(subMonths(now, 1), 'yyyy-MM-dd');
        break;
      case '3months':
        from = format(subMonths(now, 3), 'yyyy-MM-dd');
        break;
      default:
        from = format(subMonths(now, 1), 'yyyy-MM-dd');
    }

    return { from, to };
  };

  const { from, to } = getDateRange();
  const chartPeriod = period === '1week' ? 'weekly' : 'weekly';

  return (
    <div className="container mx-auto max-w-md px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">통계</h1>
        <p className="text-sm text-muted-foreground mt-1">
          나의 운동 진행 상황을 확인하세요
        </p>
      </div>

      {/* Period Selector */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="1week">최근 1주</TabsTrigger>
          <TabsTrigger value="1month">최근 1개월</TabsTrigger>
          <TabsTrigger value="3months">최근 3개월</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Charts */}
      <div className="space-y-6">
        <FrequencyChart from={from} to={to} period={chartPeriod} />
        <VolumeChart from={from} to={to} period={chartPeriod} />
      </div>

      {/* Empty State Helper Text */}
      <div className="text-center py-8">
        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
        <p className="text-sm text-muted-foreground mb-4">
          운동 기록이 쌓이면 여기서 진행 상황을 확인할 수 있어요
        </p>
        <Link href="/record">
          <Button>운동 시작하기</Button>
        </Link>
      </div>
    </div>
  );
}
