import { twMerge } from 'tailwind-merge';
import { revalidatePath } from 'next/cache';

import {
  startSubmission,
} from '@/server/Main';
 
import Buttons from './Buttons';
import Clock from './Clock';
import Icons from './Icons';
import Layout from './Layout';
import Stars from './Stars';
import StartButton from './StartButton';

export default function PreStartPage({
  currentUser,
  userId,
  day,
  year,
  leaderboard
}: {
  currentUser: {
    display_name: string,
    avatar_color: AvatarColor
  },
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {

  const fillerFn = async() => { 'use server'; return; }
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
          star_1: false,
          star_2: false
        }} />
        <Clock time={{
          totalTime: 0,
          time_to_first_star: null,
          time_to_second_star: null
        }} />

        <Icons 
          isDisabled={true}
        />
      </div>
      <div /> {/* spacer div */}
      <Buttons 
        disabled={{
          undo: true,
          star: true,
          pause: false,
        }}
        functions={{
          undo: fillerFn,
          star: fillerFn,
          isPause: false,
          pause: async () => {
            'use server';
            const resp = await startSubmission(
              userId,
              day,
              year,
              leaderboard
            );
            if (500 === resp.status) {
              console.error(resp.error);
              return;
            } 
            revalidatePath('/');
            return 0;
          }
        }}
      />
    </Layout>
  );
}
