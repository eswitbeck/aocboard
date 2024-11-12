import { useState, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { IMaskInput } from 'react-imask';

import {
  PlayIcon,
  PlayCircleIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon
} from '@heroicons/react/20/solid';

import { H3, Base, Small } from '../../core/text';

import Modal from '../Modal';

const DateTimeInput = ({
  value,
  onChange,
  className,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) => {
  return <IMaskInput
    mask="00/00/0000 00:00:00.000"
    placeholder="MM/DD/YYYY HH:MM:SS.MMM"
    placeholderChar="-"
    value={value}
    lazy={false}
    overwrite
    definitions={{
      '0': /[\d-]/,
    }}
    onAccept={(value) => {
      onChange(value);
    }}
    {...props}
    className={className}
  />
};

const localize = (time: string) => {
  return new Date(time).toLocaleDateString(
    'en-us',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      fractionalSecondDigits: 3
    }
  )
  .replace(
    /(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)\.(\d+).*/,
    '$3-$1-$2T$4:$5:$6.$7'
  );
}


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
  updateStar: (
    timestamp: string,
    star: 'star_1' | 'star_2'
  ) => void;
  updateStartTime: (timestamp: string) => void;
  updatePause: (timestamp: string, id: number) => void;
}) {
  const isoRegex = new RegExp(
    '([\\d-]{4})-' + // year
    '([\\d-]{2})-' + // month
    '([\\d-]{2})T' + // day
    '([\\d-]{2}):' + // hour
    '([\\d-]{2}):' + // minute
    '([\\d-]{2})\\.' + // second
    '([\\d-]{3})Z?' // millisecond
  );
  const initTimes = times?.map(time => ({
    timestamp: localize(time.timestamp)
  })) || null;
  const [timesBuffer, setTimesBuffer] = useState<string[] | null>(
    initTimes?.map(
      (time) => time.timestamp.replace(isoRegex, '$2/$3/$1 $4:$5:$6.$7')
    ) || null
  );

  useEffect(() => {
    if (!isOpen) {
      const initTimes = times?.map(time => ({
        timestamp: localize(time.timestamp)
      })) || null;
      setTimesBuffer(
        initTimes?.map(
          (time) => time.timestamp.replace(isoRegex, '$2/$3/$1 $4:$5:$6.$7')
        ) || null
      );
    }
  }, [times]);

  if (null === times || timesBuffer?.length !== times.length) {
    return null;
  }

  const handleClose = () => {
    close();
    setTimesBuffer(
      times.map((time) => time.timestamp) || null
    );
  }

  const handleChange = (
    value: string,
    i: number
  ) => {
    const newTimesBuffer = [...timesBuffer!];
    newTimesBuffer[i] = value;
    setTimesBuffer(newTimesBuffer);
  }

  const isOverlapping = (i: number) => {
    return timesBuffer![i + 1] &&
      timesBuffer![i] >= timesBuffer![i + 1];
  }
  const isIncomplete = (i: number) => {
    return timesBuffer![i].match(/-/);
  }

  const isInvalid = timesBuffer!.some((_, i) => {
    return isOverlapping(i) || isIncomplete(i);
  });

  const handleSubmit = () => {
    const reformat = (time: string) => {
      return new Date(time).toISOString();
    }

    if (!times) {
      close();
      return;
    }
    const updates = timesBuffer!
      .map((time, i) => {
        return {
          timestamp: reformat(time),
          type: times[i].type,
          i
        };
      })
      .filter((time, index) => {
        return time.timestamp !== times[index].timestamp;
      });

    if (updates.length === 0 || isInvalid) {
      close();
      return;
    }

    const promises = updates
      .map((time) => {
        switch (time.type) {
          case 'start':
            return updateStartTime(time.timestamp);
          case 'pause':
            return updatePause(time.timestamp, times[time.i].id as number);
          case 'resume':
            return updatePause(time.timestamp, times[time.i].id as number);
          case 'star_1':
            return updateStar(time.timestamp, 'star_1');
          case 'star_2':
            return updateStar(time.timestamp, 'star_2');
        }
      }
    );

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
      submitIsDisabled={isInvalid}
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
          "h-[45vh]"
        )}>
          {timesBuffer!.map((time, i) => {
            const Icon = iconLookup[times[i].type];
            const isOverlapping = timesBuffer![i + 1] &&
              time >= timesBuffer![i + 1];
            const isIncomplete = time.match(/-/);
            return (
              <div key={i} className={twMerge(
                "flex flex-row gap-4",
              )}>
                <Icon className={twMerge(
                  "w-6 h-6",
                  "text-gray-500",
                  times[i].type === 'star_1' && "text-gray-100",
                  times[i].type === 'star_2' && "text-yellow-500",
                )} />
                <DateTimeInput className={twMerge(
                   "w-full",
                    "bg-gray-800",
                    "text-gray-200",
                    "border-b border-gray-400",
                    "focus:border-orange-500",
                    "focus:outline-none",
                    "transition-colors",
                    (isOverlapping || isIncomplete) && "border-red-500",
                  )}
                  value={
                    timesBuffer[i]
                      .replace(isoRegex, '$2/$3/$1 $4:$5:$6.$7')
                  }
                  onChange={(value) => {
                    handleChange(value, i);
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="relative">
          {timesBuffer!.some((_, i) => isOverlapping(i)) && (
            <Small className="text-red-500 font-bold absolute left-0 top-0">
              Times must be in order
            </Small>
          )}
          {timesBuffer!.some((_, i) => isIncomplete(i)) && (
            <Small className="text-red-500 font-bold absolute left-0 top-4">
              Times must be complete
            </Small>
          )}
        </div>
      </div>
    </Modal>
    );
  }