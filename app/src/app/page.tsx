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
  completeSubmission
} from '@/server/Main';

import Clock from '@/app/_components/Clock';
import PausesList from '@/app/_components/PausesList';
import ServerActionButton from '@/app/_components/ServerActionButton';
import Stars from '@/app/_components/Stars';

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

function ActivePage({
  time,
  totalTime,
  submission
}: {
  time: Date,
  totalTime: TotalTime,
  submission: Submission
}) {
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
      <Stars submission={submission} />
      <PausesList
        pauses={submission.pauses}
        start_time={submission.start_time}
      />
    </div>
  );
}


function PausedPage({
  totalTime,
  submission
}: {
  totalTime: TotalTime,
  submission: Submission
}) {
  return (
    <div className="flex flex-col gap-2">
      <p>Paused</p>
      <p>{timestamp2Clock(totalTime.totalTime)}</p>
      <ResumeButton />
      <RestartButton />
      <Stars submission={submission} />
      <PausesList
        pauses={submission.pauses}
        start_time={submission.start_time}
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

function CompletePage({
  totalTime,
  submission
}: {
  totalTime: TotalTime,
  submission: Submission
}) {
  return (
    <div>
      <p>Complete!</p>
      <p>{timestamp2Clock(totalTime.totalTime)}</p>
      <RestartButton />
      <Stars submission={submission} />
      <PausesList
        pauses={submission.pauses}
        start_time={submission.start_time}
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
