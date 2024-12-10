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
  Small
} from '@/components/core/text';

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
          "flex flex-col justify-center items-center",
          "gap-1 p-2 rounded-2xl",
          "w-20 h-20",
          disabled.undo ? "bg-gray-800" : "bg-gray-700 cursor-pointer"
        )}
        onClick={disabled.undo
          ? undefined
          : () => functions.undo()}
      >
        <ArrowUturnLeftIcon
          className={twMerge(
            disabled.undo ? "text-gray-700" : "text-gray-400",
            "w-10 h-10"
          )}
        />
        <Small
          className={twMerge(
            disabled.undo ? "text-gray-700" : "text-gray-400",
            "text-base"
          )}
        >
          Undo
        </Small>
      </div>
      <div
        className={twMerge(
          "flex justify-center items-center flex-col gap-1",
          "w-28 h-28",
          "p-2 rounded-3xl",
          "relative",
          disabled.star ? "bg-gray-800" : "bg-orange-500 cursor-pointer"
        )}
        onClick={disabled.star
          ? undefined
          : () => functions.star()
        }
      >
        {disabled.star ? (
          <StarIcon
            className={twMerge(
              "text-gray-700",
              "w-20 h-20"
            )}
          />
        ) : (
          <SolidStarIcon
            className={twMerge(
              "text-gray-800",
              "w-20 h-20"
            )}
          />
        )} 
        <Small
          className={twMerge(
            disabled.star ? "text-gray-700" : "text-gray-800",
            "text-base"
          )}
        >
          Claim Star
        </Small>
        <PlusIcon
          className={twMerge(
            disabled.star ? "text-gray-700" : "text-gray-800",
            "w-6 h-6",
            "absolute top-2 right-2"
          )}
        />
      </div>
      <div
        className={twMerge(
          "flex justify-center items-center flex-col",
          "gap-1",
          "w-20 h-20",
          "p-2 rounded-2xl",
          disabled.pause ? "bg-gray-800" :
            functions.isPause ? "bg-gray-700 cursor-pointer" :
            "bg-orange-500 cursor-pointer"
        )}
        onClick={disabled.pause
          ? undefined
          : () => functions.pause()}
      >
        {functions.isPause ? (
          disabled.pause ? (
            <PauseIcon
              className={twMerge(
                "text-gray-700",
                "w-12 h-12"
              )}
            />
          ) : (
            <SolidPauseIcon
              className={twMerge(
                "text-gray-400",
                "w-12 h-12"
              )}
            />
          )
        ) : (
          disabled.pause ? (
            <PlayIcon
              className={twMerge(
                "text-gray-700",
                "w-12 h-12"
              )}
            />
          ) : (
            <SolidPlayIcon
              className={twMerge(
                "text-gray-800",
                "w-12 h-12"
              )}
            />
          )
        )}
        <Small className={twMerge(
          functions.isPause
            ? disabled.pause
              ? "text-gray-800"
              : "text-gray-400"
            : "text-gray-700",
          "text-base"
        )}>
          {functions.isPause ? "Pause" : "Start"}
        </Small>
      </div>
    </div>
  );
}
