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

  const href = encodeURIComponent(`/j/${code}`);

  if (401 === status) {
    return (
      <div className="flex flex-col gap-8 items-center mt-[34%] mx-12">
        <Base className="text-gray-300 text-lg text-center">
          You need to be logged in to join a leaderboard.
        </Base>
        <Link
          href={`/login?redirect=${href}`}
          className="btn btn-primary"
        >
          Log in
        </Link>
        <Base className="text-gray-300 text-lg text-center">
          Or create an account if you don&apos;t have one.
        </Base>
        <Link
          href={`/create-account?redirect=${href}`}
          className="btn btn-primary"
        >
          Register
        </Link>
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
