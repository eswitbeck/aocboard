'use client';
import {
  useEffect,
  useState
} from 'react';

import { convertToTimeString } from '@/shared/utils';

export default function Clock ({
  startingDiff
}: {
  startingDiff: number | null
}) {
  'use client';
  const [diff, setDiff] = useState<number | null>(
    null === startingDiff ? null : Date.now() - startingDiff
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (null !== diff) {
        setDiff(Date.now() - diff);
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
