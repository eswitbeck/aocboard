'use client';
import { useRef } from 'react';

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
    <div className="flex flex-col gap-2">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Username"
          ref={usernameRef}
        />
        <input
          type="password"
          placeholder="Password"
          ref={passwordRef}
        />
      </div>
      <div className="flex gap-4">
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={handleClick}
        >
          Login
        </button>
      </div>
    </div>
  );
}
