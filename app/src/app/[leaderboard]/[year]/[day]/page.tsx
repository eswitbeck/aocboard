import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import {
  timestamp2Clock,
  timestamp2TimeString
} from '@/shared/utils';

import {
  getUserIdFromAccessToken,
  getSubmission,
  pauseSubmission,
  resumeSubmission,
  restartSubmission,
  completeSubmission,
  updatePause,
  updateStartTime,
  updateStarTime,
  getLanguages,
  updateLanguage,
  updateSubmission,
  getSelf
} from '@/server/Main';

import {
  Base,
  H1,
  H3,
  A
} from '@/components/core/text';

import Avatar from '@/components/shared/Avatar';

import PreStartPage from '@/components/day/PreStartPage';
import ActivePage from '@/components/day/ActivePage';
import PausedPage from '@/components/day/PausedPage';
import CompletePage from '@/components/day/CompletePage';

import RedirectLogin from '@/app/_components/RedirectLogin';

export default async function SubmissionPage({
  params: {
    leaderboard,
    year,
    day
  }
}: {
  params: {
    leaderboard: number,
    year: number,
    day: number
  }
}) {
  const time = new Date();
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

  if (submissionResponse.status === 401) {
    return <RedirectLogin />;
  }

  const currentUser = currentUserResp.body!.data;

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

  if (submissionResponse.status === 404) {
    return (
      <>
        <PreStartPage
          currentUser={currentUser}
          userId={userId}
          day={day}
          year={year}
          leaderboard={leaderboard}
        />
      </>
    );
  }

  if (submissionResponse.status >= 400) {
    return <ErrorPage error={submissionResponse.error} />;
  }

  const submission = submissionResponse.body?.data!;
  // @ts-ignore -- dangerous ignore here
  const totalTime = submissionResponse.body?.total_time!;

  const isComplete = submission.star_2_end_time !== null;
  const isPaused = !Object.hasOwn(totalTime, 'lastTimestamp');

  if (isComplete) {
    return (
      <CompletePage
        currentUser={currentUser}
        totalTime={totalTime}
        submission={submission}
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
    );
  }
  if (!isPaused) {
    return (
      <ActivePage
        currentUser={currentUser}
        time={time}
        totalTime={totalTime}
        submission={submission}
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
    );
  }

  return (
    <PausedPage
      currentUser={currentUser}
      totalTime={totalTime}
      submission={submission}
      userId={userId}
      day={day}
      year={year}
      leaderboard={leaderboard}
    />
  );
}

function ErrorPage({ error }: { error: string }) {
  return (
    <div>
      Error: {error}
    </div>
  );
}
