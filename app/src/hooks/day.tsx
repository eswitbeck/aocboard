'use client';
import {
  useState,
  useEffect,
  useRef
} from 'react';

import {
  timestamp2Clock
} from '@/shared/utils';

export const useClock = (
  time: TotalTime
) => {
  const now = new Date();
  const startingDifference = time.totalTime +
    (time.lastTimestamp 
      ? now.getTime() - new Date(time.lastTimestamp).getTime()
      : 0);

  const ref = useRef<number>(startingDifference);

  const [milliseconds, setmilliSeconds] = useState<number>(
    startingDifference
  );

  useEffect(() => {
    ref.current = milliseconds;
  }, [milliseconds, time]);

  useEffect(() => {
    if (time.lastTimestamp) {
      const interval = setInterval(() => {
        setmilliSeconds(ref.current + 1000);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [time]);

  return {
    clock: timestamp2Clock(milliseconds)
  };
}
