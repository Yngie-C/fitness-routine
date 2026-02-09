'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function TodayRoutine() {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayDisplay = format(today, 'M월 d일 (EEEE)', { locale: ko });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          오늘의 운동
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {todayDisplay}
        </p>
        <div className="flex gap-2">
          <Link href={`/record/${todayStr}`} className="flex-1">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              오늘 기록하기
            </Button>
          </Link>
          <Link href="/record">
            <Button variant="outline">
              <Calendar className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
