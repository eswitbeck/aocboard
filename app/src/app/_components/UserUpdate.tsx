'use client';
import { useState } from 'react';

export default function UserUpdate({
  updateUser
}: {
  updateUser: (
    field: 'link' | 'display_name',
    value: string
  ) => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState('');
  const [link, setLink] = useState('');

  const handleLinkUpdate = async () => {
    await updateUser('link', link);
  }

  const handleDisplayNameUpdate = async () => {
    await updateUser('display_name', displayName);
  }

  return (
    <div>
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <button onClick={handleDisplayNameUpdate}>Update Display Name</button>
      <input
        type="text"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <button onClick={handleLinkUpdate}>Update Link</button>
    </div>
  );
}
