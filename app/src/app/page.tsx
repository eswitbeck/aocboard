import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import {
  getUserIdFromAccessToken,
  logout,
  getAccountData,
  getLeaderboards,
  createLeaderboard as createLeaderboardApi,
  deleteLeaderboard
} from '@/server/Main';

import {
  LoginButton,
  LogoutButton
} from '@/app/_components/AuthButtons';

import {
  CreateLeaderboardButton,
  DeleteLeaderboardButton
} from '@/app/_components/LeaderboardButtons';

export default async function Page() {
  const userid = await getUserIdFromAccessToken();
  const isLoggedIn = userid !== null;
  if (!isLoggedIn) {
    redirect('/login');
  }

  const accountData = await getAccountData(userid);
  if (!accountData || !accountData.body) {
    redirect('/login');
  }

  const { 
    body: {
      data: { username, display_name, link }
  } } = accountData;

  const leaderboards = await getLeaderboards(userid);

  const handleLogout = async () => {
    'use server';
    await logout();
    revalidatePath('/');
  }

  const createLeaderboard = async () => {
    'use server';
    await createLeaderboardApi(userid);
    revalidatePath('/');
  }

  return (
    <div className="flex flex-col justify-center gap-4">
      <h1>Dashboard</h1>
      <p>Welcome, {display_name}!</p>
      <p>Your username is {username}.</p>
      {link && <p>Your account link is {link}.</p>}
      <LogoutButton logout={handleLogout} />
      <CreateLeaderboardButton createLeaderboard={createLeaderboard} />
      {/* TODO fix the typing here and horrid className runon */}
      {leaderboards && leaderboards.body && leaderboards.body.data.map(
        (leaderboard: any) => (
          <Link href={`/${leaderboard.id}`} key={leaderboard.id}>
            <div className="rounded-md flex gap-2 flex-col items-center justify-center cursor-pointer border-black border-2 p-4">
              <p>{leaderboard.name}</p>
              <p>Participants:</p>
              {leaderboard.participants.map((participant: any) => (
                <p key={participant.id}>{participant.display_name}</p>
              ))}
              <DeleteLeaderboardButton deleteLeaderboard={async () => {
                'use server';
                await deleteLeaderboard(userid, leaderboard.id);
                revalidatePath('/');
              }} />
            </div>
          </Link>
        )
      )}
    </div>
  );
}
