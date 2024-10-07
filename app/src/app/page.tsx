import { revalidatePath } from 'next/cache';

import { convertToTimeString } from '@/shared/utils';

import {
  startSubmission,
  getSubmission,
  pauseSubmission,
  resumeSubmission,
  deleteSubmission,
} from '@/server/Main';

import Clock from '@/app/_components/Clock';
import ServerActionButton from '@/app/_components/ServerActionButton';


export default async function Home() {
  const time = new Date();

  const response = await getSubmission(1, 1, 1, 1);
  if (response.status === 404) {
    return <div>
      You haven't started yet
      <ServerActionButton
        fn={async () => {
          'use server';
          const response = await startSubmission(1, 1, 1, 1);
          revalidatePath('/');
        }}
      >
        Start
      </ServerActionButton>
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
          startingDiff={totalTime.totalTime + time.getTime() - totalTime.lastTimestamp!}
        />
        <ServerActionButton
          fn={async () => {
            'use server';
            const response = await pauseSubmission(1, 1, 1, 1);
            revalidatePath('/');
          }}
       >
        Pause
      </ServerActionButton>
      <RestartButton />
      <ul className="flex flex-col gap-2">
        {submission.pauses.map((pause) => (
          <li key={pause.id}>
            <div className="flex gap-2">
              <p>{pause.start_time}</p>
              <p>{pause.end_time}</p>
            </div>
          </li>
        ))}
      </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p>Paused</p>
      <p>{convertToTimeString(totalTime.totalTime)}</p>
      <ServerActionButton
        className="border border-black max-w-max px-2 py-1"
        fn={async () => {
          'use server';
          const response = await resumeSubmission(1, 1, 1, 1);
          revalidatePath('/');
        }}
      >
        Resume
      </ServerActionButton>
      <RestartButton />
      <ul className="flex flex-col gap-2">
        {submission.pauses.map((pause) => (
          <li key={pause.id}>
            <div className="flex gap-2">
              <p>{new Date(pause.start_time).toLocaleDateString('en-us', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
              <p>{pause.end_time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
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
