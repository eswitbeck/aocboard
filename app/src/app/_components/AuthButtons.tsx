'use client';
import { useRef } from 'react';
import { twMerge } from 'tailwind-merge';

export function LoginButton({
  login
}: {
  login: (
    username: string,
    password: string
  ) => Promise<void>;
}) {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleClick = async () => {
    if (!usernameRef.current || !passwordRef.current) {
      return;
    }

    await login(
      usernameRef.current.value,
      passwordRef.current.value
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <input
        type="text"
        placeholder="username"
        ref={usernameRef}
        className={twMerge(
          'rounded-2xl',
          'p-2',
          'focus:outline-none',
          'focus:ring-2 focus:ring-orange-500',
          'bg-gray-700',
          'text-gray-200',
          'placeholder-gray-400'
        )}
      />
      <input
        type="password"
        placeholder="password"
        ref={passwordRef}
        className={twMerge(
          'rounded-2xl',
          'p-2',
          'focus:outline-none',
          'focus:ring-2 focus:ring-orange-500',
          'bg-gray-700',
          'text-gray-200',
          'placeholder-gray-400'
        )}
      />
      <div className="flex gap-4">
        <button
          className={twMerge(
            'bg-orange-500 p-2 rounded',
            'text-gray-700',
            'focus:outline-none',
            'focus:ring-2 focus:ring-gray-100',
            'rounded-2xl w-24'
          )}
          onClick={handleClick}
        >
          Login
        </button>
      </div>
    </div>
  );
}
