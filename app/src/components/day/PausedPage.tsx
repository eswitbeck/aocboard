import { twMerge } from 'tailwind-merge';
import { revalidatePath } from 'next/cache';

import {
  resumeSubmission
} from '@/server/Main';

import {
  useClock
} from '@/hooks/day';
 
import Buttons from './Buttons';
import Clock from './Clock';
import Icons from './Icons';
import Layout from './Layout';
import Stars from './Stars';
import StartButton from './StartButton';

export default function PausedPage ({
  currentUser,
  totalTime,
  submission,
  userId,
  day,
  year,
  leaderboard
}: {
  currentUser: {
    display_name: string,
    avatar_color: AvatarColor
  },
  totalTime: TotalTime,
  submission: Submission | null,
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {

  const fillerFn = async() => { 'use server'; return 0; }
  return (
    <Layout
      currentUser={currentUser}
      leaderboard={leaderboard}
      day={day}
      year={year}
    >
      <div className={twMerge(
        "flex flex-col gap-2",
        "w-full py-4"
      )}>
        <Stars stars={{
          star_1: !!totalTime.time_to_first_star,
          star_2: false,
        }} />
        <Clock time={totalTime} isEditable />
        <Icons 
          isDisabled={false}
        />
      </div>
      <div /> {/* spacer div */}
      <Buttons 
        disabled={{
          undo: false,
          star: true,
          pause: false,
        }}
        functions={{
          undo: fillerFn,
          star: fillerFn,
          isPause: false,
          pause: async () => {
            'use server';
            await resumeSubmission(
              userId,
              day,
              year,
              leaderboard
            );
            revalidatePath('/');
            return 0;
          }
        }}
      />
    </Layout>
  );
}
