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
      <div className="flex flex-col gap-2">
        <Stars stars={{ star_1: false, star_2: false }} />
        <Clock timeString="00:00:00" />
        <Icons 
          isDisabled={true}
        />
      </div>
      <div /> {/* spacer div */}
      <Buttons 
        disabled={{
          undo: true,
          star: true,
          pause: false
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
