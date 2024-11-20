import { twMerge } from 'tailwind-merge';

import { revalidatePath } from 'next/cache';
import {
  logout,
} from '@/server/Main';

export default function LogoutButton() {
  'use client';
  return (
    <button
      onClick={async () => {
        'use server';
        await logout();
        revalidatePath('/');
      }}
      className={twMerge(
        'bg-orange-500',
        'text-lg text-gray-700',
        'rounded-2xl',
        'px-4 py-2',
        'focus:outline-none',
        'focus:ring-2 focus:ring-white'
      )}
    >
      Log out
    </button>
  );
}
