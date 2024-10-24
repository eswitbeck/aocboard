'use client';
import { useState } from 'react';

export default function LeaderboardUpdate({ 
  updateLeaderboard
}: {
  updateLeaderboard: (
    field: 'name' | 'note',
    value: string
  ) => Promise<void>
}) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const handleNameUpdate = async () => {
    await updateLeaderboard('name', name);
  }

  const handleNoteUpdate = async () => {
    await updateLeaderboard('note', note);
  }

  return (
    <div>
      <input 
        type="text" 
        placeholder="Name" 
        value={name} 
        onChange={e => setName(e.target.value)}
      />
      <button onClick={handleNameUpdate}>Update Name</button>
      <input 
        type="text" 
        placeholder="Note" 
        value={note} 
        onChange={e => setNote(e.target.value)}
      />
      <button onClick={handleNoteUpdate}>Update Note</button>
    </div>
  );
}
