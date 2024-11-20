import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  joinLeaderboard,
  getUserIdFromAccessToken
} from '@/server/Main';

import { Base } from '@/components/core/text';

import RedirectLogin from '@/app/_components/RedirectLogin';

export default async function JoinPage({
  params
}: {
  params: Promise<{
    code: string;
  }>;
}) {
  const { code } = await params;
  const userId = await getUserIdFromAccessToken();
  const result = await joinLeaderboard(userId, code);

  const { status } = result;

  if (401 === status) {
    return (
      <div className="flex flex-col gap-2 items-center mt-[34%] mx-12">
        <Base className="text-gray-300 text-lg text-center mb-12">
          You need to be logged in to join a leaderboard.
        </Base>
        {/* button for login */}
        
        <Base className="text-gray-300 text-lg text-center mb-12">
          Or create an account if you don&apos;t have one.
        </Base>
        {/* button for create account */}
      </div>
    );
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
