'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isFuture,
  addMonths,
  subMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface WorkoutCalendarProps {
  workoutDates: Record<string, number>; // { '2026-02-01': 1, '2026-02-03': 2 }
  selectedDate: string | null; // 'YYYY-MM-DD' or null
  onSelectDate: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
  currentYear: number;
  currentMonth: number; // 1-based (1=January)
}

export default function WorkoutCalendar({
  workoutDates,
  selectedDate,
  onSelectDate,
  onMonthChange,
  currentYear,
  currentMonth,
}: WorkoutCalendarProps) {
  const currentDate = new Date(currentYear, currentMonth - 1, 1);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const handlePrevMonth = () => {
    const prev = subMonths(currentDate, 1);
    onMonthChange(prev.getFullYear(), prev.getMonth() + 1);
  };

  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1);
    onMonthChange(next.getFullYear(), next.getMonth() + 1);
  };

  const handleDateClick = (date: Date) => {
    if (isFuture(date)) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    onSelectDate(dateStr);
  };

  return (
    <Card className="p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          aria-label="이전 달"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentDate, 'yyyy년 M월', { locale: ko })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          aria-label="다음 달"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day, idx) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${
              idx === 0
                ? 'text-red-500'
                : idx === 6
                  ? 'text-blue-500'
                  : 'text-muted-foreground'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasWorkout = dateStr in workoutDates;
          const isSelected = selectedDate === dateStr;
          const isTodayDate = isToday(day);
          const isFutureDate = isFuture(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const dayOfWeek = day.getDay();

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(day)}
              disabled={isFutureDate}
              className={`
                h-10 w-full rounded-md relative transition-colors
                ${!isCurrentMonth ? 'text-muted-foreground/40' : ''}
                ${isFutureDate ? 'opacity-30 cursor-not-allowed' : 'hover:bg-accent'}
                ${isSelected ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                ${isTodayDate && !isSelected ? 'ring-2 ring-primary' : ''}
                ${dayOfWeek === 0 && !isSelected ? 'text-red-500' : ''}
                ${dayOfWeek === 6 && !isSelected ? 'text-blue-500' : ''}
              `}
            >
              <span className="text-sm">{format(day, 'd')}</span>
              {hasWorkout && (
                <div
                  className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                    isSelected ? 'bg-primary-foreground' : 'bg-primary'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
