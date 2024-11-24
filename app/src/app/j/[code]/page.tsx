import { twMerge } from 'tailwind-merge';
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
      <div className={twMerge(
        "flex flex-col gap-8 items-center",
        "mt-[34%] mx-12 md:mt-[25%]"
      )}>
        <Base className="text-gray-300 text-lg text-center">
          You need to be logged in to join a leaderboard.
        </Base>
        <Link
          href={`/login?redirect=${href}`}
          className={twMerge(
            'bg-orange-500',
            'text-lg text-gray-700',
            'rounded-2xl',
            'px-4 py-2',
            'focus:outline-none',
            'focus:ring-2 focus:ring-white'
          )}
        >
          Log in
        </Link>
        <Base className="text-gray-300 text-lg text-center">
          Or create an account if you don&apos;t have one.
        </Base>
        <Link
          href={`/create-account?redirect=${href}`}
          className={twMerge(
            'border-2 border-gray-400',
            'text-lg text-gray-300',
            'rounded-2xl',
            'px-4 py-2',
            'focus:outline-none',
            'focus:ring-2 focus:ring-orange-500'
          )}
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
    const { id, name } = result.body!.data;
    return (
      <div>
        <Base className="text-gray-300 text-lg text-center mt-12 mx-12">
          You&apos;ve joined the leaderboard,
          <br />
          <span className="text-orange-500 font-bold">
            {name}
          </span>.
          <br />
          Welcome!
        </Base>
        <div className="flex flex-col gap-4 items-center justify-center mt-8">
          <Link
            className={twMerge(
              "text-gray-700",
              "bg-orange-500",
              "rounded-2xl",
              "p-2",
              "focus:outline-none",
              "focus:ring-2 focus:ring-gray-100",
              "w-36",
              "text-center"
            )}
            href={`/${id}`}
          >
            Continue
          </Link>
        </div>
      </div>
    );
  }

  if (500 === status) {
    redirect('/');
  }

  return null;
}
