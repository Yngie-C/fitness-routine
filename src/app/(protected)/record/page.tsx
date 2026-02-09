'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import WorkoutCalendar from '@/components/record/workout-calendar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function RecordPage() {
  const router = useRouter();
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [workoutDates, setWorkoutDates] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(format(now, 'yyyy-MM-dd'));

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const res = await fetch(`/api/v1/sessions/calendar?year=${currentYear}&month=${currentMonth}`);
        if (res.ok) {
          const json = await res.json();
          setWorkoutDates(json.data.session_counts || {});
        }
      } catch (error) {
        console.error('Failed to fetch calendar data:', error);
      }
    };

    fetchCalendarData();
  }, [currentYear, currentMonth]);

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleGoToDate = (date: string) => {
    router.push(`/record/${date}`);
  };

  const todayStr = format(now, 'yyyy-MM-dd');

  return (
    <div className="container mx-auto max-w-md px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">운동 기록</h1>
        <p className="text-sm text-muted-foreground mt-1">날짜를 선택하여 운동을 기록하세요</p>
      </div>

      <WorkoutCalendar
        workoutDates={workoutDates}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onMonthChange={handleMonthChange}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />

      {/* 선택된 날짜 미리보기 */}
      {selectedDate && (
        <div className="mt-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{selectedDate}</div>
              <div className="text-sm text-muted-foreground">
                {workoutDates[selectedDate]
                  ? `${workoutDates[selectedDate]}개의 운동 기록`
                  : '기록 없음'}
              </div>
            </div>
            <Button size="sm" onClick={() => handleGoToDate(selectedDate)}>
              {workoutDates[selectedDate] ? '기록 보기' : '기록하기'}
            </Button>
          </div>
        </div>
      )}

      {/* 오늘 기록하기 FAB */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40"
        onClick={() => handleGoToDate(todayStr)}
        aria-label="오늘 운동 기록하기"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
