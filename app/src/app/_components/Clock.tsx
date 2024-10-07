'use client';
import {
  useEffect,
  useState,
  useRef
} from 'react';

import { convertToTimeString } from '@/shared/utils';

export default function Clock ({
  startingDiff
}: {
  startingDiff: number | null
}) {
  'use client';
  const [diff, setDiff] = useState<number | null>(
    null === startingDiff ? null : startingDiff
  );
  const diffRef = useRef(diff);

  useEffect(() => {
    diffRef.current = diff;
  }, [diff]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (null !== diffRef.current) {
        setDiff(diffRef.current + 1000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeDisplay = convertToTimeString(diff);

  if (!timeDisplay) {
    return (
      <div>
        No active timer
      </div>
    );
  }

  return (
    <div>
      {timeDisplay}
    </div>
  );
}
