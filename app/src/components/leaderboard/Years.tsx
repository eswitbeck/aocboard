'use client';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

import {
  H1,
  Base,
  A
} from '@/components/core/text';

import Avatar from './Avatar';
 

export default function Years({
  leaderboardId,
  userId,
  leaderboard,
  userMap
}: {
  leaderboardId: number,
  userId: number,
  userMap: LeaderboardUserMap,
  leaderboard: LeaderboardInfo
}) {
  const years = Array.from(
    { length: new Date().getFullYear() - 2015 + 1 },
    (_, i) => i + 2015
  ).reverse();

  const [yearsOpen, setYearsOpen] = useState<boolean[]>(
    years.map((year) => true)
  );

  return (
    <div className="flex flex-col gap-3 mt-20">
      {years.map((year, i) => (
        <Year
          key={year}
          year={year}
          leaderboard={leaderboardId}
          userId={userId}
          yearInfo={leaderboard[year]}
          userMap={userMap}
          isOpen={yearsOpen[i]}
          setIsOpen={(isOpen) => {
            setYearsOpen(
              (prev) => prev.map(
                (_, j) => (i === j ? isOpen : prev[j])
              )
            );
          }}
        />
      ))}
    </div>
  );
}

function Year({
  year,
  leaderboard,
  userId,
  yearInfo,
  userMap,
  isOpen,
  setIsOpen
}: {
  year: number,
  leaderboard: number,
  userId: number,
  yearInfo: LeaderboardInfo[number],
  userMap: LeaderboardUserMap,
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}) {
  const days = Array.from({ length: 25 }, (_, i) => i + 1);
  return (
    <div>
      <div className={twMerge(
        "bg-gray-800 p-4"
      )}>
        <div
          className={twMerge(
            "flex justify-between items-center",
            "bg-gray-600 px-4 py-2",
            "rounded-lg",
            "group hover:bg-gray-500"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Base className="text-2xl font-bold">
            {year}
          </Base>
          <div className="px-2 rounded-lg">
            <Base className={twMerge(
              "text-3xl text-gray-400 group-hover:text-gray-300"
            )}>
              {isOpen ? '▼' : '▲'}
            </Base>
          </div>
        </div>
        <div className={twMerge(
          "flex flex-col",
          "mt-2",
        )}>
          {isOpen && days.map((day, i) => (
            <DayRow
              key={day}
              leaderboard={leaderboard}
              year={year}
              day={day}
              userId={userId}
              userMap={userMap}
              dayInfo={yearInfo?.[day] ?? null}
              className={twMerge(
                i !== days.length - 1 && "border-b-2 border-gray-600"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const isComplete = (
  userId: number,
  dayInfo: LeaderboardInfo[number][number] | null
): {
  1: boolean,
  2: boolean,
} => {
  const result = dayInfo?.[userId];

  if (!result) {
    return {
      1: false,
      2: false
    };
  }

  return {
    1: !!result.star_1_end_time,
    2: !!result.star_2_end_time
  };
}

function DayRow({
  leaderboard,
  year,
  day,
  userId,
  userMap,
  dayInfo,
  className
}: {
  leaderboard: number,
  year: number
  day: number,
  userId: number,
  userMap: LeaderboardUserMap,
  dayInfo: LeaderboardInfo[number][number] | null,
  className?: string
}) {
  const userCompletions = isComplete(userId, dayInfo);
  const users = Object.entries(userMap)
    .map(([userid, user]) => {
      const id = parseInt(userid);
      const score = dayInfo?.[id]?.score ?? 0;
      const complete = isComplete(id, dayInfo);
      return {
        id,
        user,
        score,
        complete
      };
    })
    .sort(({ score }, { score: score2 }) => score2 - score);

  return (
    <div className={twMerge(
      "p-2",
      className
    )}>
      <div className={twMerge(
        "flex items-center gap-2",
      )}>
        <Link href={`/${leaderboard}/${year}/${day}`}>
          <div className={twMerge(
            "flex justify-center items-center",
            "px-3 py-1 rounded-lg",
            "group",
            userCompletions[2]
              ? "bg-gray-600 hover:bg-gray-500"
              : "bg-gray-500 hover:bg-gray-400"
          )}>
            {isComplete(userId, dayInfo)[1] ? (
              <Base className="text-2xl">
                ☰
              </Base>
            ) : (
              <Base className="text-2xl text-gray-700">
                ▶ 
              </Base>
            )}
          </div>
        </Link>

        <div className={twMerge(
          "p-2 min-w-12",
          "flex justify-center items-center",
        )}>
          <Base className="text-xl font-bold">
            {day}
          </Base>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {users.map(({ user, score, complete, id }) => (
            <div className="h-12 w-12 flex justify-center items-center relative">
              <div className={twMerge(
                "absolute -top-1",
                "flex items-center",
                complete[2] ? "-right-3" : "-right-1"
              )} style={{ zIndex: 1 }}>
                {complete[1] && (
                  <Base
                    className="text-gray-300 text-2xl"
                    style={{
                      textShadow: '0 0 6px #E6EAE8'
                    }}
                  >
                    ★
                  </Base>
                )}
                {complete[2] && (
                  <Base
                    className="text-yellow-300 text-2xl"
                    style={{
                      textShadow: '0 0 6px #FFF0AD'
                    }}
                  >
                    ★
                  </Base>
                )}
              </div>
              <Avatar
                user={user}
                size="md"
                key={id}
                disabled={!complete[1]}
                className="outline-gray-800"
                />
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}
