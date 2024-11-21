'use client';
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Base } from '@/components/core/text';

export default function LoginButton({
  register
}: {
  register: (
    username: string,
    password: string
  ) => Promise<HTTPLike<void>>;
}) {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [exists, setExists] = useState(false);

  const handleClick = async () => {
    if (!usernameRef.current || !passwordRef.current) {
      return;
    }

    const resp = await register(
      usernameRef.current.value,
      passwordRef.current.value
    );

    if (resp.status === 409) {
      setExists(true);
    }
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
          'placeholder-gray-400',
          exists && 'ring-2 ring-red-500'
        )}
      />
      {exists && (
        <Base className="text-red-500 mx-12 text-center">
          This username has already been taken. Please choose another.
        </Base>
      )}
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
          Register
        </button>
      </div>
    </div>
  );
}
