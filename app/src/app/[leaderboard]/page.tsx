import Link from 'next/link';

import {
  getUsersByLeaderboard,
  getLeaderboardInfo
} from '@/server/Main';

type UsersArray = {
  id: number;
  display_name: string;
  score: number;
  link: string | null;
}[];

export default async function Page({
  params: { leaderboard }
}: {
  params: { leaderboard: number }
}) {
  const userId = 1; // TODO

  const usersResp = await getUsersByLeaderboard(
    userId,
    leaderboard
  );
  const leaderboardInfoResp = await getLeaderboardInfo(
    userId,
    leaderboard
  );

  if (usersResp.status !== 200|| leaderboardInfoResp.status !== 200) {
    return (
      <div className="flex flex-col gap-2">
        {usersResp?.error && <div>Users: {usersResp.error}</div>}
        {leaderboardInfoResp?.error && <div>Leaderboard Info: {leaderboardInfoResp.error}</div>}
      </div>
    );
  }

  const users = usersResp.body!.data;
  const leaderboardInfo = leaderboardInfoResp.body!.data;

  const usersArray: UsersArray = Object.entries(users).map(
    ([id, { display_name, score, link }]) => ({
      id: parseInt(id),
      display_name,
      score,
      link
    })
  );

  const years = Array.from(
    { length: new Date().getFullYear() - 2015 + 1 },
    (_, i) => i + 2015
  ).reverse();
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-1">
        <Users users={usersArray} />
      </div>
      <div className="flex flex-col gap-4 col-span-3">
        {years.map((year) => (
          <Year
            key={year}
            year={year}
            leaderboard={leaderboard}
            yearInfo={leaderboardInfo[year]}
            userMap={users}
          />
        ))}
      </div>
    </div>
  );
}

function Users({
  users
}: {
  users: UsersArray
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold">Users</h2>
      {users.map((user) => (
        <div key={user.id} className="flex flex-row gap-2">
          <div>{user.display_name}</div>
          <div>Score: {user.score}</div>
          <div>{user.link ? <a href={user.link}>Link</a> : 'No Link'}</div>
        </div>
      ))}
    </div>
  );
}

function Year({
  year,
  leaderboard,
  yearInfo,
  userMap
}: {
  year: number,
  leaderboard: number,
  yearInfo: LeaderboardInfo[number],
  userMap: LeaderboardUserMap
}) {
  const days = Array.from({ length: 25 }, (_, i) => i + 1);
  return (
    <div className="border-2 border-black rounded-lg p-4 flex flex-col gap-2 justify-center">
      <h2 className="text-2xl font-bold">{year}</h2>
      <div className="flex flex-col gap-1">
        {days.map((day) => (
          <Link key={day} href={`/${leaderboard}/${year}/${day}`}>
            <div key={day} className="w-full border-b-2 border-slate-200"> 
              {day}
            </div>
            <Day
              day={day}
              userMap={userMap}
              dayInfo={yearInfo?.[day] ?? null}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

function Day ({
  day,
  userMap,
  dayInfo
}: {
  day: number,
  userMap: LeaderboardUserMap,
  dayInfo: LeaderboardInfo[number][number] | null
}) {
  if (null === dayInfo) {
    return null;
  }
  return (
    <div className="border-2 border-black rounded-lg p-4 flex flex-col gap-2 justify-center">
      <div className="flex flex-col gap-1">
        {dayInfo.map(d => (
          <div key={d.user_id} className="flex flex-row gap-2">
            <div>{userMap[d.user_id].display_name}</div>
            <div>Start Time: {d.start_time}</div>
            <div>Star 1 End Time: {d.star_1_end_time ?? 'Not Yet'}</div>
            <div>Star 2 End Time: {d.star_2_end_time ?? 'Not Yet'}</div>
            <div>Language: {d.language ?? 'N/A'}</div>
            <div>Note: {d.note ?? 'N/A'}</div>
            <div>Link: {d.link ? <a href={d.link}>Link</a> : 'N/A'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}