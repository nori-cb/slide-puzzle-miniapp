'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatTime } from '@/lib/puzzle';

interface TimerProps {
  isRunning: boolean;
  onTimeUpdate: (time: number) => void;
  reset: number; // リセット用のトリガー
}

export function Timer({ isRunning, onTimeUpdate, reset }: TimerProps) {
  const [time, setTime] = useState(0);

  // リセット
  useEffect(() => {
    setTime(0);
    onTimeUpdate(0);
  }, [reset]);

  // タイマー処理
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime((prev) => {
        const newTime = prev + 10;
        onTimeUpdate(newTime);
        return newTime;
      });
    }, 10);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUpdate]);

  return (
    <div className="text-center">
      <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Time</div>
      <div className="timer-display">{formatTime(time)}</div>
    </div>
  );
}
