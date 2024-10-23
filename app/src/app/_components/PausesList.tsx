'use client'
import { revalidatePath } from 'next/cache';

import {
  useState,
  useEffect
} from 'react';

import {
  timestamp2TimeString,
  timestamp2Timestamp,
  generateUTCString
} from '@/shared/utils';

export default function PausesList({
  pauses,
  start_time,
  updatePause,
  updateStart
}: {
  start_time: string,
  pauses: Pause[],
  updatePause: (
    pauseId: number,
    time: string
  ) => void,
  updateStart: (
    time: string
  ) => void
}) {
  const [pauseTimes, setPauseTimes] = useState<Pause[]>([]);
  const [start, setStart] = useState<string>('');

  useEffect(() => {
    setPauseTimes(
      pauses.map((pause) => {
        return {
          ...pause,
          start_time: timestamp2Timestamp(pause.start_time) as string,
          end_time: timestamp2Timestamp(pause.end_time)
        }
      })
    );

    setStart(timestamp2Timestamp(start_time) as string);
  }, [pauses, start_time]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <p>Start Time</p>
        <input
          type="datetime-local"
          value={start}
          className="w-64"
          onChange={(e) => {
            updateStart(generateUTCString(e.target.value));
          }}
        />
      </div>
      <p>Pause Times</p>
      <ul className="flex flex-col gap-2">
        {pauseTimes.map((p, i) => (
          <li key={i}>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={p.start_time}
                onChange={(e) => {
                  updatePause(
                    p.start_id,
                    generateUTCString(e.target.value)
                  );
                }}
              />
              {p.end_time && (
                <input
                  type="datetime-local"
                  value={p.end_time}
                  onChange={(e) => {
                    updatePause(
                      p.end_id as number,
                      generateUTCString(e.target.value)
                    );
                  }}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
