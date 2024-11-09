'use client';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

import { ClockIcon } from '@heroicons/react/20/solid';

import {
  H1,
  Base,
  Small,
  A
} from '@/components/core/text';

import Avatar from '../shared/Avatar';
import UserModal from './UserModal';

export default function Years({
  getSubmission,
  leaderboardId,
  leaderboardDetails,
  userId,
  leaderboard,
  userMap
}: {
  getSubmission: SubmissionFetcher,
  leaderboardId: number,
  leaderboardDetails: {
    name: string,
    note: string | null,
    owner_id: number,
    created_at: string
  },
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

  const collapseAll = () => {
    setYearsOpen(years.map(() => false));
  }
  const expandAll = () => {
    setYearsOpen(years.map(() => true));
  }

  const [submissionFetcher, setSubmissionFetcher] =
    useState<EmptySubmissionFetcher | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <>
      {!!submissionFetcher && (
        <UserModal
          userId={selectedId!}
          getSubmission={submissionFetcher}
          setSubmissionFetcher={() => {
            setSubmissionFetcher(null);
            setSelectedId(null);
          }}
          userMap={userMap}
        />
      )}
      <div className="flex flex-col gap-3 mt-24">
        <div className={twMerge(
          "flex flex-col gap-3",
          "bg-gray-800 p-4",
          "rounded-lg"
        )}>
          <div className="flex flex-col">
            <div className="flex gap-2 justify-between items-center mb-3">
              <div className="flex gap-2">
                <Avatar
                  user={userMap[leaderboardDetails.owner_id]}
                  size="xs"
                  className="outline-gray-800"
                />
                {userMap[leaderboardDetails.owner_id].link ? (
                    <A
                      className="text-sm text-gray-400"
                      href={userMap[leaderboardDetails.owner_id].link}
                    >
                      {userMap[leaderboardDetails.owner_id].display_name}
                    </A>
                ) : (
                  <Small className="text-gray-400">
                    {userMap[leaderboardDetails.owner_id].display_name}
                  </Small>
                )}
              </div>
              <Small className="text-gray-400">
                Created {new Date(leaderboardDetails.created_at)
                  .toLocaleDateString()}
              </Small>
            </div>
            <H1 className="my-2">
              {leaderboardDetails.name}
            </H1>
          </div>
          {leaderboardDetails.note && (
            <Base className="text-gray-300">
              {leaderboardDetails.note}
            </Base>
          )}
          <div className="flex gap-8 justify-center">
            <div onClick={expandAll} className={twMerge(
              "bg-gray-700 p-2 rounded-lg",
              "flex justify-center items-center",
              "group hover:bg-gray-500"
            )}>
              <Base className={twMerge(
                "text-lg text-gray-400 group-hover:text-gray-300"
              )}>
                Expand All
              </Base>
            </div>
            <div onClick={collapseAll} className={twMerge(
              "bg-gray-700 p-2 rounded-lg",
              "flex justify-center items-center",
              "group hover:bg-gray-500"
            )}>
              <Base className={twMerge(
                "text-lg text-gray-400 group-hover:text-gray-300"
              )}>
                Collapse All
              </Base>
            </div>
          </div>
        </div>
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
            setSubmissionFetcher={setSubmissionFetcher}
            setSelectedId={setSelectedId}
            getSubmission={getSubmission}
          />
        ))}
      </div>
    </>
  );
}

function Year({
  year,
  leaderboard,
  userId,
  yearInfo,
  userMap,
  isOpen,
  setIsOpen,
  setSubmissionFetcher,
  setSelectedId,
  getSubmission
}: {
  year: number,
  leaderboard: number,
  userId: number,
  yearInfo: LeaderboardInfo[number],
  userMap: LeaderboardUserMap,
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void,
  setSubmissionFetcher: (fetcher: null | EmptySubmissionFetcher) => void,
  setSelectedId: (id: number) => void,
  getSubmission: SubmissionFetcher
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
              key={`${year}-${day}`}
              leaderboard={leaderboard}
              year={year}
              day={day}
              userId={userId}
              userMap={userMap}
              dayInfo={yearInfo?.[day] ?? null}
              setSubmissionFetcher={setSubmissionFetcher}
              setSelectedId={setSelectedId}
              getSubmission={getSubmission}
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
  isActive: boolean
} => {
  const result = dayInfo?.[userId];

  if (!result) {
    return {
      1: false,
      2: false,
      isActive: false
    };
  }

  return {
    1: !!result.star_1_end_time,
    2: !!result.star_2_end_time,
    isActive: !(result.star_1_end_time && result.star_2_end_time)
  };
}

function DayRow({
  leaderboard,
  year,
  day,
  userId,
  userMap,
  dayInfo,
  setSubmissionFetcher,
  setSelectedId,
  getSubmission,
  className
}: {
  leaderboard: number,
  year: number
  day: number,
  userId: number,
  userMap: LeaderboardUserMap,
  dayInfo: LeaderboardInfo[number][number] | null,
  setSubmissionFetcher: (fetcher: null | EmptySubmissionFetcher) => void,
  setSelectedId: (id: number) => void,
  getSubmission: SubmissionFetcher,
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
            "p-1 rounded-lg",
            "h-10 w-10",
            "group",
            userCompletions[2] 
              ? "bg-gray-600 hover:bg-gray-500"
              : userCompletions.isActive 
                ? "bg-orange-500 hover:bg-orange-400"
                : "bg-gray-500 hover:bg-gray-400"
          )}>
            {isComplete(userId, dayInfo)[2] ? (
              <Base className="text-2xl">
                ☰
              </Base>
            ) : isComplete(userId, dayInfo).isActive ? (
              <ClockIcon className="h-6 w-6 text-gray-700" />
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
            <div
              key={id}
              className="h-12 w-12 flex justify-center items-center relative"
              onClick={() => {
                setSubmissionFetcher(
                  //@ts-ignore React treats () => as prevState => newState
                  () => () => getSubmission(
                    id,
                    day,
                    year,
                    leaderboard
                  )
                );
                setSelectedId(id);
              }}
            >
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
                disabled={!complete[1] && !complete.isActive}
                className="outline-gray-800"
                />
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}
