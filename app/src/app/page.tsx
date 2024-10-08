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
  deleteSubmission,
} from '@/server/Main';

import Clock from '@/app/_components/Clock';
import PausesList from '@/app/_components/PausesList';
import ServerActionButton from '@/app/_components/ServerActionButton';

export default async function Home() {
  const time = new Date();

  const response = await getSubmission(1, 1, 1, 1);
  if (response.status === 404) {
    return <div>
      You haven't started yet
      <StartButton />
    </div>
  }

  if (response.status >= 400) {
    return <div>
      Error: {response.error}
    </div>
  }

  const submission = response.body?.data!;
  const totalTime = response.body?.total_time!;

  const isPaused = !Object.hasOwn(totalTime, 'lastTimestamp');

  if (!isPaused) {
    return (
      <div>
        <Clock
          startingDiff={totalTime.totalTime +
            time.getTime() -
            new Date(totalTime.lastTimestamp!).getTime()}
        />
        <PauseButton />
        <RestartButton />
        <PausesList pauses={submission.pauses} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p>Paused</p>
      <p>{timestamp2Clock(totalTime.totalTime)}</p>
      <ResumeButton />
      <RestartButton />
      <PausesList pauses={submission.pauses} />
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

function RestartButton() {
  return (
    <div className="flex flex-col gap-2 max-w-max px-2 py-1">
      <p>Didn&apos;t mean to start?</p>
      <ServerActionButton
        fn={async () => {
          'use server';
          const response = await deleteSubmission(1, 1, 1, 1);
          revalidatePath('/');
        }}
      >
        Restart
      </ServerActionButton>
    </div>
  );
}
