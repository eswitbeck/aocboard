import { revalidatePath } from 'next/cache';

import { startSubmission } from '@/server/Main';

import ServerActionButton from '../core/ServerActionButton';

export default function StartButton({
  userId,
  day,
  year,
  leaderboard
}: {
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {
  return (
    <ServerActionButton
      fn={async () => {
        'use server';
        const response = await startSubmission(userId, day, year, leaderboard);
        revalidatePath('/');
      }}
    >
      Start
    </ServerActionButton>
  );
}
