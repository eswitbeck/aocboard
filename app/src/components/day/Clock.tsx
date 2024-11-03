import { twMerge } from 'tailwind-merge';

import {
  PencilIcon
} from '@heroicons/react/24/outline';

import {
  Base
} from '../core/text';

export default function Clock({
  timeString,
  isEditable,
  onClick
}: {
  timeString: string,
  isEditable?: boolean,
  onClick?: () => void
}) {
  return (
    <div
      className={twMerge(
        'flex justify-center items-center',
        'p-4 rounded-3xl',
        'w-full relative',
        isEditable
          ? 'cursor-pointer bg-gray-600 hover:bg-gray-500'
          : 'cursor-default bg-gray-700'
      )}
      onClick={isEditable ? onClick : undefined}
    >
      <Base className={twMerge(
        'text-6xl font-bold',
        isEditable ? 'text-gray-200' : 'text-gray-500',
        'relative'
      )}>
        {timeString}
        {isEditable && (
          <PencilIcon
            className={twMerge(
              "absolute -right-9 top-1/2 -translate-y-1/2 text-gray-200",
              "w-9 h-9",
              "text-gray-300"
            )}
          />
        )}
      </Base>
    </div>
  );
}
