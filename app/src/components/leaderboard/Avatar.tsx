import { twMerge } from 'tailwind-merge';
import {Base } from '@/components/core/text';

export default function Avatar({
  user,
  backgroundColor = 'gray-200',
  size = 'sm',
  disabled = false,
  className
}: {
  user: {
    display_name: string,
    link: string | null
  },
  backgroundColor: string,
  size?: 'sm' | 'md' | 'lg',
  disabled?: boolean,
  className?: string
}) {
  // TODO get color/avatar from account
  // lookup active/disabled colors
  return (
    <div
      className={twMerge(
        "bg-red-500 rounded-full",
        size === 'sm' ? "h-8 w-8" :
        size === 'md' ? "h-10 w-10" :
                        "h-16 w-16",
        "border-4 border-red-900",
        "flex justify-center items-center",
        "outline-gray-700 outline",
        className
      )}
    >
      <Base className={twMerge(
        "text-red-900 font-bold",
        size === 'sm' ? "text-lg" :
        size === 'md' ? "text-xl" :
                        "text-2xl",
      )}>
        {user.display_name[0].toUpperCase()}
      </Base>
    </div>
  );
}

