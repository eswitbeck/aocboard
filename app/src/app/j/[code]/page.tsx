import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  joinLeaderboard,
  getUserIdFromAccessToken
} from '@/server/Main';

import RedirectLogin from '@/app/_components/RedirectLogin';

export default async function JoinPage({
  params: { code }
}: {
  params: {
    code: string;
  };
}) {
  const userId = await getUserIdFromAccessToken();
  const result = await joinLeaderboard(userId, code);

  const { status } = result;

  if (401 === status) {
    return <RedirectLogin />;
  }

  if ([403, 404].includes(status)) {
    redirect('/404');
  }

  if (200 === status) {
    const leaderboardId = result.body!.data;
    return (
      <div>
        <p>Successfully joined leaderboard!</p>
        <Link href={`/${leaderboardId}`}>
          View leaderboard
        </Link>
      </div>
    );
  }

  if (500 === status) {
    redirect('/');
  }

  return null;
}
