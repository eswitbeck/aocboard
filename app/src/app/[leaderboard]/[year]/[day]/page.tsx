import { redirect } from 'next/navigation';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { revalidatePath } from 'next/cache';

import {
  getUserIdFromAccessToken,
  getSelf,
  getSubmission,

  claimStar,
  startSubmission,
  pauseSubmission,
  resumeSubmission,
  undoStar,

  updatePause,
  updateStartTime,
  updateStarTime,
  getLanguages,
  updateLanguage,
  updateSubmission,

  getLeaderboardDayStatus,
  copyDay
} from '@/server/Main';

import Layout from '@/components/day/Layout';
import Container from '@/components/day/Container';
import RedirectLogin from '@/app/_components/RedirectLogin';

const wrapFn = (
  fn: (...arg0: any[]) => Promise<HTTPLike<any>>,
  leaderboard: number
) => {
  return async (...args: any) => {
    'use server';
    const response = await fn(...args);
    if (![400, 401, 403, 500].includes(response.status)) {
      revalidatePath(`/${leaderboard}`);
    }
    return response;
  } 
}

export default async function SubmissionPage({
  params
}: {
  params: Promise<{
    leaderboard: number,
    year: number,
    day: number
  }>
}) {
  const time = new Date();
  const { leaderboard, year, day } = await params;
  if (year < 2015 || year > time.getFullYear() || day < 1 || day > 25) {
    redirect(`/${leaderboard}`);
  }

  const userId = await getUserIdFromAccessToken();

  const currentUserResp = await getSelf(userId);

  const submissionResponse = await getSubmission(
    userId,
    day,
    year,
    leaderboard
  );

  const getLeaderboardDayStatusResp = await getLeaderboardDayStatus(
    userId,
    leaderboard,
    day,
    year
  );

  if (submissionResponse.status === 401) {
    return <RedirectLogin />;
  }

  if (submissionResponse.status === 403) {
    return (
      <div>
        <p>
          Either you aren&apos;t on this leaderboard or it doesn&apos;t exist!
        </p>
        <Link href={`/`}>
          Go home
        </Link>
      </div>
    );
  }

  if (submissionResponse.status >= 400 && submissionResponse.status !== 404) {
    return <ErrorPage error={submissionResponse.error} />;
  }

  const currentUser = currentUserResp.body!.data;
  const leaderboardDayStatus = getLeaderboardDayStatusResp.body!.data;

  return (
    <Layout
      currentUser={currentUser}
      leaderboard={leaderboard}
      day={day}
      year={year}
    >
      <Container
        submissionResponse={submissionResponse}
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
        getSubmission={getSubmission}
        claimStarApi={wrapFn(claimStar, leaderboard)}
        startSubmissionApi={wrapFn(startSubmission, leaderboard)}
        pauseSubmissionApi={wrapFn(pauseSubmission, leaderboard)}
        resumeSubmssionApi={wrapFn(resumeSubmission, leaderboard)}
        undoStarApi={wrapFn(undoStar, leaderboard)}
        languages={(await getLanguages()).body!.data}
        updateLanguageApi={wrapFn(updateLanguage, leaderboard)}
        updateSubmission={wrapFn(updateSubmission, leaderboard)}
        updateStartTimeApi={wrapFn(updateStartTime, leaderboard)}
        updateStarTimeApi={wrapFn(updateStarTime, leaderboard)}
        updatePauseApi={wrapFn(updatePause, leaderboard)}
        leaderboardDayStatus={leaderboardDayStatus}
        copyDay={async (
          userId: number,
          day: number,
          year: number,
          leaderboard: number,
          targetLeaderboardIds: number[]
        ) => {
          'use server';
          return await copyDay(
            userId,
            day,
            year,
            leaderboard,
            targetLeaderboardIds
          );
        }}
      />
    </Layout>
  );
}

function ErrorPage({ error }: { error: string }) {
  return (
    <div>
      Error: {error}
    </div>
  );
}
