import { twMerge } from 'tailwind-merge';

import {
  XMarkIcon,
} from '@heroicons/react/20/solid';

export default function Modal({
  children,
  isOpen,
  close,
  submit,
  submitIsDisabled
}: {
  children?: React.ReactNode,
  isOpen: boolean,
  close: () => void,
  submit?: () => void
  submitIsDisabled?: boolean
}) {
  return (
      <div
        className={twMerge(
          "absolute left-0 top-0 w-full h-[100vh]",
          "overflow-hidden",
          "pointer-events-none",
        )}
      >
        <div
          className={twMerge(
            "absolute left-0 w-full h-full",
            "bg-gray-600",
            "rounded-t-xl",
            "z-20",
            "transition-all duration-300",
            "pointer-events-auto",
            "p-4",
          )}
          style={{
            top: isOpen ? '25%' : '100%',
          }}
        >
          <button
            className={twMerge(
              "absolute right-4 top-4",
              "bg-gray-700",
              "p-1 rounded-xl",
              "hover:bg-gray-500",
            )}
            onClick={close}
          >
            <XMarkIcon className="w-6 h-6 text-gray-200" />
          </button>
          {children}
          {submit && (
            <button
              className={twMerge(
                "bg-orange-500",
                "p-2 rounded-md",
                "hover:bg-orange-400",
                "mt-4",
                "absolute right-4",
                "text-gray-800",
                submitIsDisabled && "opacity-50 pointer-events-none",
              )}
              onClick={submitIsDisabled ? undefined : submit}
            >
              Submit
            </button>
          )}

        </div>
      </div>
  );
}
