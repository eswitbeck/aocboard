import { revalidatePath } from 'next/cache';

import {
  timestamp2Clock,
  timestamp2TimeString
} from '@/shared/utils';

import {
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
import ServerActionButton from '@/app/_components/ServerActionButton';
import Stars from '@/app/_components/Stars';
import SubmissionInputs from '@/app/_components/SubmissionInputs';

export default async function Home() {
  const time = new Date();

  const response = await getSubmission(1, 1, 1, 1);
  if (response.status === 404) {
    return <PreStartPage />;
  }

  if (response.status >= 400) {
    return <ErrorPage error={response.error} />;
  }

  const submission = response.body?.data!;
  const totalTime = response.body?.total_time!;

  const isComplete = submission.star_2_end_time !== null;
  const isPaused = !Object.hasOwn(totalTime, 'lastTimestamp');

  if (isComplete) {
    return (
      <CompletePage
        totalTime={totalTime}
        submission={submission}
      />
    );
  }
  if (!isPaused) {
    return (
      <ActivePage
        time={time}
        totalTime={totalTime}
        submission={submission}
      />
    );
  }

  return (
    <PausedPage
      totalTime={totalTime}
      submission={submission}
    />
  );
}

async function ActivePage({
  time,
  totalTime,
  submission
}: {
  time: Date,
  totalTime: TotalTime,
  submission: Submission
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
      <PauseButton />
      <RestartButton />
      <GetStarButton />
      <Stars
        submission={submission}
        updateStar={async (time, star) => {
          'use server';
          updateStarTime(1, 1, 1, 1, time, star);
          revalidatePath('/');
        }}
      />
      <PausesList
        pauses={submission.pauses}
        start_time={submission.start_time}
        updatePause={async (userId, pauseId, time) => {
          'use server';
          updatePause(userId, pauseId, time);
          revalidatePath('/');
        }}
        updateStart={async (time) => {
          'use server';
          updateStartTime(
            1, // userid
            1, // dayid
            1, // yearid
            1, // leaderboardid
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
          updateLanguage(1, 1, 1, 1, id);
          revalidatePath('/');
        }}
      />
      <SubmissionInputs
        submission={submission}
        updateSubmission={async (field, value) => {
          'use server';
          updateSubmission(1, 1, 1, 1, field, value);
          revalidatePath('/');
        }}
      />
    </div>
  );
}


async function PausedPage({
  totalTime,
  submission
}: {
  totalTime: TotalTime,
  submission: Submission
}) {
  const languages = await getLanguages();

  return (
    <div className="flex flex-col gap-2">
      <p>Paused</p>
      <p>{timestamp2Clock(totalTime.totalTime)}</p>
      <ResumeButton />
      <RestartButton />
      <Stars
        submission={submission}
        updateStar={async (time, star) => {
          'use server';
          updateStarTime(1, 1, 1, 1, time, star);
          revalidatePath('/');
        }}
      />
      <PausesList
        pauses={submission.pauses}
        start_time={submission.start_time}
        updatePause={async (userId, pauseId, time) => {
          'use server';
          updatePause(userId, pauseId, time);
          revalidatePath('/');
        }}
        updateStart={async (time) => {
          'use server';
          updateStartTime(
            1, // userid
            1, // dayid
            1, // yearid
            1, // leaderboardid
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
          updateLanguage(1, 1, 1, 1, id);
          revalidatePath('/');
        }}
      />
      <SubmissionInputs
        submission={submission}
        updateSubmission={async (field, value) => {
          'use server';
          updateSubmission(1, 1, 1, 1, field, value);
          revalidatePath('/');
        }}
      />
    </div>
  );
}

function PreStartPage() {
  return (
    <div className="flex flex-col gap-2">
      <p>You haven't started yet</p>
      <StartButton />
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
  submission
}: {
  totalTime: TotalTime,
  submission: Submission
}) {
  const languages = await getLanguages();

  return (
    <div>
      <p>Complete!</p>
      <p>{timestamp2Clock(totalTime.totalTime)}</p>
      <RestartButton />
      <Stars
        submission={submission}
        updateStar={async (time, star) => {
          'use server';
          updateStarTime(1, 1, 1, 1, time, star);
          revalidatePath('/');
        }}
      />
      <PausesList
        pauses={submission.pauses}
        start_time={submission.start_time}
        updatePause={async (userId, pauseId, time) => {
          'use server';
          updatePause(userId, pauseId, time);
          revalidatePath('/');
        }}
        updateStart={async (time) => {
          'use server';
          updateStartTime(
            1, // userid
            1, // dayid
            1, // yearid
            1, // leaderboardid
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
          updateLanguage(1, 1, 1, 1, id);
          revalidatePath('/');
        }}
      />
      <SubmissionInputs
        submission={submission}
        updateSubmission={async (field, value) => {
          'use server';
          updateSubmission(1, 1, 1, 1, field, value);
          revalidatePath('/');
        }}
      />
    </div>
  );
}

function StartButton() {
  return (
    <ServerActionButton
      fn={async () => {
        'use server';
        const response = await startSubmission(1, 1, 1, 1);
        revalidatePath('/');
      }}
    >
      Start
    </ServerActionButton>
  );
}

function PauseButton() {
  return (
    <ServerActionButton
      fn={async () => {
        'use server';
        const response = await pauseSubmission(1, 1, 1, 1);
        revalidatePath('/');
      }}
    >
      Pause
    </ServerActionButton>
  );
}

function ResumeButton() {
  return (
    <ServerActionButton
      fn={async () => {
        'use server';
        const response = await resumeSubmission(1, 1, 1, 1);
        revalidatePath('/');
      }}
    >
      Resume
    </ServerActionButton>
  );
}

function GetStarButton() {
  return (
    <ServerActionButton
      fn={async () => {
        'use server';
        const response = await completeSubmission(1, 1, 1, 1);
        revalidatePath('/');
      }}
    >
      Claim star!
    </ServerActionButton>
  );
}

function RestartButton() {
  return (
    <div className="flex flex-col gap-2 max-w-max px-2 py-1">
      <p>Didn&apos;t mean to start?</p>
      <ServerActionButton
        fn={async () => {
          'use server';
          const response = await restartSubmission(1, 1, 1, 1);
          revalidatePath('/');
        }}
      >
        Restart
      </ServerActionButton>
    </div>
  );
}
