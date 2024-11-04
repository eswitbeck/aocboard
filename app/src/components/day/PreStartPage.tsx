import { twMerge } from 'tailwind-merge';
 
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
          star_1: true,
          star_2: true
        }} />
        <Clock timeString="00:00:00" isEditable />
        <Icons 
          isDisabled={false}
        />
      </div>
      <div /> {/* spacer div */}
      <Buttons 
        disabled={{
          undo: false,
          star: false,
          pause: false,
        }}
        functions={{
          undo: fillerFn,
          star: fillerFn,
          isPause: false,
          pause: async () => {
            'use server';
            return;
          }
        }}
      />
    </Layout>
  );
}
