import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  PlayIcon,
  PlayCircleIcon,
  PauseIcon,
  StarIcon
} from '@heroicons/react/20/solid';

import { H3, Base, Small } from '../../core/text';

import Modal from '../Modal';

export default function Time({
  isOpen,
  close,
  times,
  updateStar,
  updateStartTime,
  updatePause
}: {
  isOpen: boolean;
  close: () => void;
  times: { 
    timestamp: string;
    type: 'start' | 'pause' | 'resume' | 'star_1' | 'star_2';
    id?: number;
  }[] | null;
  updateStar: (timestamp: string) => void;
  updateStartTime: (timestamp: string) => void;
  updatePause: (timestamp: string) => void;
}) {
  const [timesBuffer, setTimesBuffer] = useState<{
    timestamp: string;
    type: 'start' | 'pause' | 'resume' | 'star_1' | 'star_2'
  }[] | null>(
    JSON.parse(JSON.stringify(times))
  );

  if (!times) {
    return null;
  }

  const isOverlap = timesBuffer.some((time, index) => {
    if (index === 0) return false;
    return time.timestamp <= timesBuffer[index - 1].timestamp;
  });

  const handleClose = () => {
    close();
    setTimesBuffer(JSON.parse(JSON.stringify(times)));
  }

  const handleSubmit = () => {
    if (!times) {
      close();
      return;
    }
    const updates = timesBuffer.filter((time, index) => {
      return time !== times[index];
    });

    if (updates.length === 0 || isOverlap) {
      close();
      return;
    }

    const promises = updates.map((time) => {
      switch (time.type) {
        case 'start':
          // TODO
          return updateStartTime(time.timestamp);
        case 'pause':
          // TODO
          return updatePause(time.timestamp);
        case 'resume':
          // TODO
          return updatePause(time.timestamp);
        case 'star_1':
          // TODO
          return updateStar(time.timestamp);
        case 'star_2':
          // TODO
          return updateStar(time.timestamp);
      }
    });

    Promise.all(promises);
    close();
  }

  const iconLookup = {
    'start': PlayCircleIcon,
    'pause': PauseIcon,
    'resume': PlayIcon,
    'star_1': StarIcon,
    'star_2': StarIcon
  } as const;

  return (
    <Modal
      isOpen={isOpen}
      close={handleClose}
      submit={handleSubmit}
      submitIsDisabled={isOverlap}
    >
      <div className={twMerge(
         "flex flex-col gap-4",
      )}>
        <H3 className="text-3xl mt-0">
          Set times
        </H3>
        <div className={twMerge(
          "flex flex-col gap-2 p-4 py-2",
          "bg-gray-800 rounded-md",
          "overflow-y-auto",
          "max-h-[45vh]"
        )}>
          {timesBuffer.map((time, index) => {
            const Icon = iconLookup[time.type];
            console.log(time);
            return (
              <div key={index} className={twMerge(
                "flex flex-row gap-4",
              )}>
                <Icon className={twMerge(
                  "w-6 h-6",
                  "text-gray-500",
                  time.type === 'start' && "text-green-600",
                  time.type === 'star_1' && "text-gray-100",
                  time.type === 'star_2' && "text-yellow-500",
                )} />
                <input className={twMerge(
                   "w-full",
                    "bg-gray-800",
                    "text-gray-200",
                    "border-b border-gray-400",
                    "focus:border-orange-500",
                    "focus:outline-none",
                    "transition-colors",
                    (timesBuffer[index + 1] &&
                      time.timestamp >= timesBuffer[index + 1].timestamp) &&
                      "border-red-500",
                  )}
                  value={
                    new Date(timesBuffer[index].timestamp)
                      .toISOString()
                      .slice(0, 16)
                  }
                  onChange={(e) => {
                    const newTime = e.target.value;
                    const newTimesBuffer = JSON.parse(JSON.stringify(timesBuffer));
                    newTimesBuffer[index].timestamp = newTime;
                    setTimesBuffer(newTimesBuffer);
                  }}
                  type="datetime-local"
                />
              </div>
            );
          })}
        </div>
        <div className="relative">
          {isOverlap && (
            <Small className="text-red-500 font-bold absolute left-0 top-0">
              Times must be in order
            </Small>
          )}
        </div>
      </div>
    </Modal>
    );
  }
