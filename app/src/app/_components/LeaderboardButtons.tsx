'use client';
import { useState } from 'react';

export function CreateLeaderboardButton({
  createLeaderboard
}: {
  createLeaderboard: () => Promise<void>
}) {
  return (
    <div
      className="w-20 h-10 rounded-md flex items-center justify-center cursor-pointer border-black border-2"
      onClick={() => createLeaderboard()}
    >
      +
    </div>
  );
}

export function DeleteLeaderboardButton({
  deleteLeaderboard
}: {
  deleteLeaderboard: () => Promise<void>
}) {
  return (
    <div
      className="w-20 h-10 rounded-md flex items-center justify-center cursor-pointer border-black border-2"
      onClick={() => deleteLeaderboard()}
    >
      -
    </div>
  );
}

export function CreateInvitationButton({
  createInvitation
}: {
  createInvitation: () => Promise<HTTPLike<{}>>
}) {
  const [status, setStatus] = useState<number>(0);

  const text = {
    500: 'Error creating invitation',
    200: 'Invitation created!',
    0: 'Create invitation'
  }[status];

  return (
    <div
      className="w-20 h-10 rounded-md flex items-center justify-center cursor-pointer border-black border-2"
      onClick={
        status === 0
          ? async () => {
              const { status } = await createInvitation();
              setStatus(status);
            }
          : () => {}
      }
    >
      {text}
    </div>
  );
}
