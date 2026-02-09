'use client';

import { useEffect } from 'react';
import { useWorkoutStore } from '@/stores/workout-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Plus, Minus, X } from 'lucide-react';

export function RestTimer() {
  const { restTimer, tickRestTimer, stopRestTimer, startRestTimer } =
    useWorkoutStore();

  useEffect(() => {
    if (!restTimer.isRunning) return;

    const interval = setInterval(() => {
      tickRestTimer();

      // Vibrate when timer completes
      if (restTimer.remaining === 0) {
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.isRunning, restTimer.remaining, tickRestTimer]);

  if (!restTimer.isRunning) {
    return null;
  }

  const minutes = Math.floor(restTimer.remaining / 60);
  const seconds = restTimer.remaining % 60;
  const progress = ((restTimer.total - restTimer.remaining) / restTimer.total) * 100;

  const handleAddTime = () => {
    startRestTimer(restTimer.total + 30);
  };

  const handleReduceTime = () => {
    const newTotal = Math.max(30, restTimer.total - 30);
    startRestTimer(newTotal);
  };

  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span>휴식 타이머</span>
        </div>

        {/* Circular Progress */}
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-primary transition-all duration-1000"
              strokeDasharray={`${progress * 2.827} 282.7`}
            />
          </svg>

          {/* Timer display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold tabular-nums">
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </div>
              {restTimer.remaining === 0 && (
                <div className="text-sm font-medium text-primary mt-2">
                  완료!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReduceTime}
            disabled={restTimer.total <= 30}
          >
            <Minus className="h-4 w-4 mr-1" />
            30초
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTime}
          >
            <Plus className="h-4 w-4 mr-1" />
            30초
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={stopRestTimer}
          >
            <X className="h-4 w-4 mr-1" />
            건너뛰기
          </Button>
        </div>
      </div>
    </Card>
  );
}
