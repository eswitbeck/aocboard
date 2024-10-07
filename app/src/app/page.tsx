import { revalidatePath } from 'next/cache';

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

  const isPaused = submission.pauses.length &&
    !submission.pauses[submission.pauses.length - 1].end_time;

  if (!isPaused) {
    return (
      <div>
        <Clock
          startingDiff={time.getTime() - submission.start_time}
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
  
  // calc total time
  // events start (pause resume?)* 
  // star_1_time?
  // (pause resume?)*
  // star_2_time?

  return (
    <div>
      Paused
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
