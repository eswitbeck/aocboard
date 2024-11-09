'use client';
import { twMerge } from 'tailwind-merge';
import { useEffect, useState } from 'react';

import { useClock } from '@/hooks/day';

import {
  PencilIcon
} from '@heroicons/react/24/outline';

import {
  Base
} from '../core/text';

export default function Clock({
  time,
  isEditable,
  onClick
}: {
  time: TotalTime,
  isEditable?: boolean,
  onClick?: () => void
}) {
  const [isMounted, setIsMounted] = useState(false);
  const { clock } = useClock(time);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={twMerge(
        'flex justify-center items-center',
        'py-4 px-2 rounded-3xl mx-4',
        'relative',
        isEditable
          ? 'cursor-pointer bg-gray-700 hover:bg-gray-600'
          : 'cursor-default bg-gray-700'
      )}
      onClick={isEditable ? onClick : undefined}
    >
      <Base className={twMerge(
        'text-6xl font-bold',
        isEditable ? 'text-gray-200' : 'text-gray-600',
        'relative'
      )}>
        {clock}
        {isEditable && (
          <PencilIcon
            className={twMerge(
              "absolute -right-9 top-1/2 -translate-y-1/2",
              "w-9 h-9",
              "text-gray-400"
            )}
          />
        )}
      </Base>
    </div>
  );
}
