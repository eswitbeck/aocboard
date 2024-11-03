'use client';
import { twMerge } from 'tailwind-merge';

import {
  ArrowUturnLeftIcon,
  PauseIcon,
  PlayIcon,
  StarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

import {
  PlayIcon as SolidPlayIcon,
  PauseIcon as SolidPauseIcon,
  StarIcon as SolidStarIcon
} from '@heroicons/react/24/solid';

export default function Buttons({
  disabled,
  functions
}: {
  disabled: {
    undo: boolean,
    star: boolean,
    pause: boolean
  },
  functions: {
    undo: () => void,
    star: () => void,
    isPause: boolean,
    pause: () => void
  }
}) {
  return (
    <div className={twMerge(
      "flex justify-center gap-6 items-center",
      "w-full"
    )}>
      <div
        className={twMerge(
          "flex justify-center items-center",
          "p-2 rounded-2xl",
          disabled.undo ? "bg-gray-700" : "bg-gray-600"
        )}
        onClick={functions.undo}
      >
        <ArrowUturnLeftIcon
          className={twMerge(
            disabled.undo ? "text-gray-600" : "text-gray-200",
            "w-12 h-12"
          )}
        />
      </div>
      <div
        className={twMerge(
          "flex justify-center items-center",
          "p-2 rounded-3xl",
          "relative",
          disabled.star ? "bg-gray-700" : "bg-gray-600"
        )}
        onClick={functions.star}
      >
        <StarIcon
          className={twMerge(
            disabled.star ? "text-gray-600" : "text-gray-200",
            "w-20 h-20"
          )}
        />
        <PlusIcon
          className={twMerge(
            disabled.star ? "text-gray-600" : "text-gray-200",
            "w-6 h-6",
            "absolute top-2 right-2"
          )}
        />
      </div>
      <div
        className={twMerge(
          "flex justify-center items-center",
          "p-2 rounded-2xl",
          disabled.pause ? "bg-gray-700" : "bg-gray-600"
        )}
        onClick={functions.pause}
      >
        {functions.isPause ? (
          <PauseIcon
            className={twMerge(
              disabled.pause ? "text-gray-600" : "text-gray-200",
              "w-12 h-12"
            )}
          />
        ) : (
          <PlayIcon
            className={twMerge(
              disabled.pause ? "text-gray-600" : "text-gray-200",
              "w-12 h-12"
            )}
          />
        )}
      </div>
    </div>
  );
}
