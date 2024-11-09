import { redirect } from 'next/navigation';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

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
} from '@/server/Main';

import Layout from '@/components/day/Layout';
import Container from '@/components/day/Container';
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
        claimStarApi={claimStar}
        startSubmissionApi={startSubmission}
        pauseSubmissionApi={pauseSubmission}
        resumeSubmssionApi={resumeSubmission}
        undoStarApi={undoStar}
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
