'use client'

import { timestamp2TimeString } from '@/shared/utils';

export default function PausesList({ pauses }: { pauses: Pause[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {pauses.map((pause) => (
        <li key={pause.id}>
          <div className="flex gap-2">
            <p>{timestamp2TimeString(pause.start_time)}</p>
            <p>
              {pause?.end_time &&
                timestamp2TimeString(pause.end_time)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

