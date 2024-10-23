import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import {
  timestamp2Clock,
  timestamp2TimeString
} from '@/shared/utils';

import {
  getUserIdFromAccessToken,
  startSubmission,
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
  updateSubmission
} from '@/server/Main';

import Clock from '@/app/_components/Clock';
import LanguageInput from '@/app/_components/LanguageInput';
import PausesList from '@/app/_components/PausesList';
import RedirectLogin from '@/app/_components/RedirectLogin';
import ServerActionButton from '@/app/_components/ServerActionButton';
import Stars from '@/app/_components/Stars';
import SubmissionInputs from '@/app/_components/SubmissionInputs';

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

  const response = await getSubmission(
    userId,
    day,
    year,
    leaderboard
  );

  if (response.status === 401) {
    return <RedirectLogin />;
  }

  if (response.status === 403) {
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

  if (response.status === 404) {
    return <PreStartPage
      userId={userId}
      day={day}
      year={year}
      leaderboard={leaderboard}
    />;
  }

  if (response.status >= 400) {
    return <ErrorPage error={response.error} />;
  }

  const submission = response.body?.data!;
  // @ts-ignore -- dangerous ignore here
  const totalTime = response.body?.total_time!;

  const isComplete = submission.star_2_end_time !== null;
  const isPaused = !Object.hasOwn(totalTime, 'lastTimestamp');

  if (isComplete) {
    return (
      <CompletePage
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
      totalTime={totalTime}
      submission={submission}
      userId={userId}
      day={day}
      year={year}
      leaderboard={leaderboard}
    />
  );
}

async function ActivePage({
  time,
  totalTime,
  submission,
  userId,
  day,
  year,
  leaderboard
}: {
  time: Date,
  totalTime: TotalTime,
  submission: Submission,
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {
  const languages = await getLanguages();
  if (languages.status >= 400) {
    return <ErrorPage error={languages.error} />;
  }

  return (
    <div>
      <Clock
        startingDiff={totalTime.totalTime +
          time.getTime() -
          new Date(totalTime.lastTimestamp!).getTime()}
      />
      <PauseButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
      <RestartButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
      <GetStarButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
      <Stars
        submission={submission}
        updateStar={async (time, star) => {
          'use server';
          updateStarTime(
            userId,
            day,
            year,
            leaderboard,
            time,
            star
          );
          revalidatePath('/');
        }}
      />
      <PausesList
        pauses={submission.pauses}
        start_time={submission.start_time}
        updatePause={async (pauseId, time) => {
          'use server';
          updatePause(userId, pauseId, time);
          revalidatePath('/');
        }}
        updateStart={async (time) => {
          'use server';
          updateStartTime(
            userId,
            day,
            year,
            leaderboard,
            time
          );
          revalidatePath('/');
        }}
      />
      <LanguageInput
        selectedLanguage={submission.language}
        languages={languages.body!.data}
        updateLanguage={async (id) => {
          'use server';
          updateLanguage(userId, day, year, leaderboard, id);
          revalidatePath('/');
        }}
      />
      <SubmissionInputs
        submission={submission}
        updateSubmission={async (field, value) => {
          'use server';
          updateSubmission(userId, day, year, leaderboard, field, value);
          revalidatePath('/');
        }}
      />
    </div>
  );
}


async function PausedPage({
  totalTime,
  submission,
  userId,
  day,
  year,
  leaderboard
}: {
  totalTime: TotalTime,
  submission: Submission,
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {
  const languages = await getLanguages();

  return (
    <div className="flex flex-col gap-2">
      <p>Paused</p>
      <p>{timestamp2Clock(totalTime.totalTime)}</p>
      <ResumeButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
      <RestartButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
      <Stars
        submission={submission}
        updateStar={async (time, star) => {
          'use server';
          updateStarTime(userId, day, year, leaderboard, time, star);
          revalidatePath('/');
        }}
      />
      <PausesList
        pauses={submission.pauses}
        start_time={submission.start_time}
        updatePause={async (pauseId, time) => {
          'use server';
          updatePause(userId, pauseId, time);
          revalidatePath('/');
        }}
        updateStart={async (time) => {
          'use server';
          updateStartTime(
            userId,
            day,
            year,
            leaderboard,
            time
          );
          revalidatePath('/');
        }}
      />
      <LanguageInput
        selectedLanguage={submission.language}
        languages={languages.body!.data}
        updateLanguage={async (id) => {
          'use server';
          updateLanguage(userId, day, year, leaderboard, id);
          revalidatePath('/');
        }}
      />
      <SubmissionInputs
        submission={submission}
        updateSubmission={async (field, value) => {
          'use server';
          updateSubmission(userId, day, year, leaderboard, field, value);
          revalidatePath('/');
        }}
      />
    </div>
  );
}

function PreStartPage({
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
    <div className="flex flex-col gap-2">
      <p>You haven't started yet</p>
      <StartButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
    </div>
  );
}

function ErrorPage({ error }: { error: string }) {
  return (
    <div>
      Error: {error}
    </div>
  );
}

async function CompletePage({
  totalTime,
  submission,
  userId,
  day,
  year,
  leaderboard
}: {
  totalTime: TotalTime,
  submission: Submission,
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {
  const languages = await getLanguages();

  return (
    <div>
      <p>Complete!</p>
      <p>{timestamp2Clock(totalTime.totalTime)}</p>
      <RestartButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
      <Stars
        submission={submission}
        updateStar={async (time, star) => {
          'use server';
          updateStarTime(userId, day, year, leaderboard, time, star);
          revalidatePath('/');
        }}
      />
      <PausesList
        pauses={submission.pauses}
        start_time={submission.start_time}
        updatePause={async (pauseId, time) => {
          'use server';
          updatePause(userId, pauseId, time);
          revalidatePath('/');
        }}
        updateStart={async (time) => {
          'use server';
          updateStartTime(
            userId,
            day,
            year,
            leaderboard,
            time
          );
          revalidatePath('/');
        }}
      />
      <LanguageInput
        selectedLanguage={submission.language}
        languages={languages.body!.data}
        updateLanguage={async (id) => {
          'use server';
          updateLanguage(userId, day, year, leaderboard, id);
          revalidatePath('/');
        }}
      />
      <SubmissionInputs
        submission={submission}
        updateSubmission={async (field, value) => {
          'use server';
          updateSubmission(userId, day, year, leaderboard, field, value);
          revalidatePath('/');
        }}
      />
    </div>
  );
}

function StartButton({
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

function PauseButton({
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
        const response = await pauseSubmission(userId, day, year, leaderboard);
        revalidatePath('/');
      }}
    >
      Pause
    </ServerActionButton>
  );
}

function ResumeButton({
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
        const response = await resumeSubmission(userId, day, year, leaderboard);
        revalidatePath('/');
      }}
    >
      Resume
    </ServerActionButton>
  );
}

function GetStarButton({
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
        const response = await completeSubmission(userId, day, year, leaderboard);
        revalidatePath('/');
      }}
    >
      Claim star!
    </ServerActionButton>
  );
}

function RestartButton({
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
    <div className="flex flex-col gap-2 max-w-max px-2 py-1">
      <p>Didn&apos;t mean to start?</p>
      <ServerActionButton
        fn={async () => {
          'use server';
          const response = await restartSubmission(userId, day, year, leaderboard);
          revalidatePath('/');
        }}
      >
        Restart
      </ServerActionButton>
    </div>
  );
}
