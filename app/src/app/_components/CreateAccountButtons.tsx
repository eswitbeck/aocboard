'use client'
import { useState, useEffect } from 'react';

const CreateAccountButtons = ({
  registerUser
}: {
  registerUser: (
    username: string,
    password: string
  ) => Promise<HTTPLike<void>>
}
) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col items-center gap-2">
      <h1>Create Account Page!</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="border border-1 border-black p-2 rounded-md"
        onClick={() => {
          registerUser(username, password);
        }}
      >
        Create Account
      </button>
    </div>
  );
}

export default CreateAccountButtons;
