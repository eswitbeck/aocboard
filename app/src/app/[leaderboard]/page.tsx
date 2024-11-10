import { twMerge } from 'tailwind-merge'
import Link from 'next/link';

import {
  getSubmission,
  getUsersByLeaderboard,
  getLeaderboardInfo,
  getUserIdFromAccessToken
} from '@/server/Main';

import RedirectLogin from '@/app/_components/RedirectLogin';
import ErrorPage from '@/components/leaderboard/ErrorPage';
import ForbiddenPage from '@/components/leaderboard/ForbiddenPage';
import UsersDisplay from '@/components/leaderboard/UsersDisplay';
import Years from '@/components/leaderboard/Years';

import {
  A,
  H1,
  H3,
  Base
} from '@/components/core/text';


export default async function Page({
  params
}: {
  params: Promise<{ leaderboard: number }>
}) {
  const leaderboard = (await params).leaderboard;
  const userId = await getUserIdFromAccessToken();

  const usersResp = await getUsersByLeaderboard(
    userId,
    leaderboard
  );
  const leaderboardInfoResp = await getLeaderboardInfo(
    userId,
    leaderboard
  );

  if (usersResp.status === 401 || leaderboardInfoResp.status === 401) {
    return <RedirectLogin />
  }

  if (usersResp.status === 403 || leaderboardInfoResp.status === 403) {
    return <ForbiddenPage />;
  }

  if (usersResp.status !== 200|| leaderboardInfoResp.status !== 200) {
    return <ErrorPage
      usersResponse={usersResp}
      leaderboardInfoResponse={leaderboardInfoResp}
    />;
  }

  const users = usersResp.body!.data;
  const {
    data: leaderboardInfo,
    leaderboard: leaderboardDetails
  } = leaderboardInfoResp.body!;

  const usersArray: UsersArray = Object.entries(users).map(
    ([id, { display_name, score, link, avatar_color }]) => ({
      id: parseInt(id),
      display_name,
      score,
      link,
      avatar_color
    })
  ).sort(({ score: a }, { score: b }) => b - a);

  const years = Array.from(
    { length: new Date().getFullYear() - 2015 + 1 },
    (_, i) => i + 2015
  ).reverse();

  return (
    <>
    <UsersDisplay
      users={usersArray}
      currentUser={users[userId!]}
    />
    <Years
      leaderboardDetails={leaderboardDetails}
      getSubmission={async (
        userId: number,
        year: number,
        month: number,
        day: number
      ) => {
        'use server';
        return await getSubmission(userId, year, month, day);
      }}
      leaderboard={leaderboardInfo}
      userMap={users}
      leaderboardId={leaderboard}
      userId={userId as number}
    />
  </>
  );
}
