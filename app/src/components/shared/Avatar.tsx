import { twMerge } from 'tailwind-merge';
import { Base } from '@/components/core/text';

const AVATAR_COLORS = {
  red: {
    border: 'border-red-900',
    bg: 'bg-red-500',
    text: 'text-red-900',
  },
  amber: {
    border: 'border-amber-900',
    bg: 'bg-amber-500',
    text: 'text-amber-900',
  },
  green: {
    border: 'border-green-900',
    bg: 'bg-green-500',
    text: 'text-green-900',
  },
  orange: {
    border: 'border-orange-900',
    bg: 'bg-orange-500',
    text: 'text-orange-900',
  },
  yellow: {
    border: 'border-yellow-900',
    bg: 'bg-yellow-500',
    text: 'text-yellow-900',
  },
  emerald: {
    border: 'border-emerald-900',
    bg: 'bg-emerald-500',
    text: 'text-emerald-900',
  },
  lime: {
    border: 'border-lime-900',
    bg: 'bg-lime-500',
    text: 'text-lime-900',
  },
  teal: {
    border: 'border-teal-900',
    bg: 'bg-teal-500',
    text: 'text-teal-900',
  },
  cyan: {
    border: 'border-cyan-900',
    bg: 'bg-cyan-500',
    text: 'text-cyan-900',
  },
  blue: {
    border: 'border-blue-900',
    bg: 'bg-blue-500',
    text: 'text-blue-900',
  },
  indigo: {
    border: 'border-indigo-900',
    bg: 'bg-indigo-500',
    text: 'text-indigo-900',
  },
  purple: {
    border: 'border-purple-900',
    bg: 'bg-purple-500',
    text: 'text-purple-900',
  },
  fuchsia: {
    border: 'border-fuchsia-900',
    bg: 'bg-fuchsia-500',
    text: 'text-fuchsia-900',
  },
  pink: {
    border: 'border-pink-900',
    bg: 'bg-pink-500',
    text: 'text-pink-900',
  },
  slate: {
    border: 'border-slate-900',
    bg: 'bg-slate-500',
    text: 'text-slate-900',
  },
} as { [key in AvatarColor]: {
  border: string,
  bg: string,
  text: string,
} };

export default function Avatar({
  user,
  size = 'sm',
  disabled = false,
  className
}: {
  user: {
    display_name: string,
    link: string | null,
    avatar_color: AvatarColor
  },
  size?: 'xs' | 'sm' | 'md' | 'lg' | '3xl',
  disabled?: boolean,
  className?: string
}) {
  return (
    <div className="relative">
      <div
        className={twMerge(
          "rounded-full",
          size === 'xs' ? "h-6 w-6" :
          size === 'sm' ? "h-8 w-8" :
          size === 'md' ? "h-10 w-10" :
          size === 'lg' ? "h-16 w-16" :
                          "h-36 w-36",
          size === '3xl' ? "border-8" :
                          "border-4",
          AVATAR_COLORS[user.avatar_color].border,
          AVATAR_COLORS[user.avatar_color].bg,
          "flex justify-center items-center",
          "outline",
          `outline-gray-900`,
          className
        )}
      >
        <Base className={twMerge(
          "font-bold",
          AVATAR_COLORS[user.avatar_color].text,
          size === 'xs' ? "text-sm" :
          size === 'sm' ? "text-lg" :
          size === 'md' ? "text-xl" :
          size === 'lg' ? "text-2xl" :
                          "text-5xl",
        )}>
          {user.display_name[0].toUpperCase()}
        </Base>
      </div>
      {disabled && (
        <div className={twMerge(
          "absolute rounded-full",
          size === 'xs' ? "h-6 w-6" :
          size === 'sm' ? "h-8 w-8" :
          size === 'md' ? "h-10 w-10" :
          size === 'lg' ? "h-16 w-16" :
                          "h-36 w-36",
          "bg-neutral-600",
          "top-0 left-0",
          "opacity-55",
        )}/>
      )}
    </div>
  );
}
