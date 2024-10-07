import { revalidatePath } from 'next/cache';

import { convertToTimeString } from '@/shared/utils';

import {
  startSubmission,
  getSubmission,
  pauseSubmission,
  resumeSubmission,
} from '@/server/Main';

import Clock from '@/app/_components/Clock';
import ServerActionButton from '@/app/_components/ServerActionButton';


export default async function Home() {
  const time = new Date();

  const response = await getSubmission(1, 1, 1, 1);
  if (response.status === 404) {
    const handleClick = async () => {
      'use server';
      const response = await startSubmission(1, 1, 1, 1);
      revalidatePath('/'); // revalidate this page
    }
    return <div>
      You haven't started yet
      <ServerActionButton
        fn={handleClick}
      >
        Start
      </ServerActionButton>
    </div>
  }

  if (response.status !== 200) {
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      Paused
      {convertToTimeString(totalTime.totalTime)}
      <ServerActionButton
        fn={async () => {
          'use server';
          const response = await resumeSubmission(1, 1, 1, 1);
          revalidatePath('/');
        }}
      >
        Resume
      </ServerActionButton>
    </div>
  );
}
