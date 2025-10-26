'use client';

import { useState, useEffect } from 'react';

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Target: November 1st, 2025 at midnight
      const targetDate = new Date('2025-11-01T00:00:00');
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        const totalSeconds = Math.floor(difference / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          totalSeconds,
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
        });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="fixed top-2 right-2 md:top-4 md:right-4 z-50 bg-red-900/80 backdrop-blur-sm border-2 md:border-4 border-yellow-400 p-2 md:p-3 font-mono shadow-lg">
      <div className="text-center">
        <div className="text-yellow-400 text-[10px] md:text-xs font-bold mb-1 uppercase tracking-wider">
          Countdown Until Reimbursement
        </div>
        <div className="text-white text-xs md:text-sm mb-1 md:mb-2">
          <span className="font-bold">November 1st</span>
        </div>
        <div className="flex gap-0.5 md:gap-1 items-center justify-center text-yellow-400">
          <div className="text-center">
            <div className="text-lg md:text-2xl font-bold tabular-nums">{formatNumber(timeLeft.days)}</div>
            <div className="text-[7px] md:text-[8px] uppercase">Days</div>
          </div>
          <div className="text-base md:text-xl font-bold pb-2 md:pb-3">:</div>
          <div className="text-center">
            <div className="text-lg md:text-2xl font-bold tabular-nums">{formatNumber(timeLeft.hours)}</div>
            <div className="text-[7px] md:text-[8px] uppercase">Hrs</div>
          </div>
          <div className="text-base md:text-xl font-bold pb-2 md:pb-3">:</div>
          <div className="text-center">
            <div className="text-lg md:text-2xl font-bold tabular-nums">{formatNumber(timeLeft.minutes)}</div>
            <div className="text-[7px] md:text-[8px] uppercase">Min</div>
          </div>
          <div className="text-base md:text-xl font-bold pb-2 md:pb-3">:</div>
          <div className="text-center">
            <div className="text-lg md:text-2xl font-bold tabular-nums">{formatNumber(timeLeft.seconds)}</div>
            <div className="text-[7px] md:text-[8px] uppercase">Sec</div>
          </div>
        </div>
        <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-yellow-400/30 hidden md:block">
          <div className="text-gray-300 text-xs">
            {timeLeft.totalSeconds.toLocaleString()} seconds
          </div>
        </div>
      </div>
    </div>
  );
}
