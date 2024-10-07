'use client';

import {
  useEffect,
  useState
} from 'react';

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

  const convertToTimeString = (diff: number | null): string | null => {
    if (null === diff) {
      return null;
    }

    const hours = `${Math.floor(diff / 3600000)}`.padStart(2, '0');
    const minutes = `${Math.floor(diff / 60000) % 60}`.padStart(2, '0');
    const seconds = `${Math.floor(diff / 1000) % 60}`.padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

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
