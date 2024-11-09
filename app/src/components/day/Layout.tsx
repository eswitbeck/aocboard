import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

import Avatar from '../shared/Avatar';
import {
  Base,
  H1,
  H3
} from '../core/text';

export default function Layout({
  currentUser,
  leaderboard,
  day,
  year,
  children
}: {
  children?: React.ReactNode,
  currentUser: {
    display_name: string,
    avatar_color: AvatarColor,
  },
  leaderboard: number,
  day: number,
  year: number
}) {
  return (
    <>
      <Header
        currentUser={currentUser}
        leaderboard={leaderboard}
        day={day}
        year={year}
      />
      <div className={twMerge(
        "flex flex-col gap-12 py-4 mb-8 mt-[10%]",
      )}>
        {children}
      </div>
    </>
  );
}

function Header ({
  currentUser,
  leaderboard,
  day,
  year
}: {
    currentUser: {
    display_name: string,
    avatar_color: AvatarColor,
  },
  leaderboard: number,
  day: number,
  year: number
  // TODO also need leaderboard name and owner (with name and color)
}) {
  return (
    <div className={twMerge(
        "w-full min-h-16",
        "p-2 px-4",
        "flex justify-center items-center gap-2", 
        "lg:hidden",
        "pt-[15px]", // for header
      )}
    >
      <Link href={`/${leaderboard}`}>
        <div className={twMerge(
          "flex justify-center items-center",
          "rounded-lg bg-gray-700 px-4 py-2",
          "w-11 h-11"
        )}>
          <Base className="text-xl font-bold text-gray-300">
            {'<'}
          </Base>
        </div>
      </Link>
       
      <div className={twMerge(
        "flex w-full justify-center items-center"
      )}>
        <div className="flex flex-col gap-1 items-center">
          <H1 className="my-0 text-gray-300">
            Day {day}
          </H1>
          <H3 className="my-0 text-gray-500">
            {year}
          </H3>
        </div>
      </div>

      <Link href="/">
        <div className={twMerge(
          "flex justify-center items-center",
          "rounded-lg bg-gray-700 px-4 py-2",
          "w-11 h-11"
        )}>
          <Avatar
            size="sm"
            className="outline-gray-700"
            user={{
              display_name: currentUser.display_name,
              link: '/',
              avatar_color: currentUser.avatar_color
            }}
          />
        </div>
      </Link>
    </div>
  );
}
