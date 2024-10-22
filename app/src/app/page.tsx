import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import {
  getUserIdFromAccessToken,
  logout,
  getAccountData,
  getLeaderboards,
  createLeaderboard as createLeaderboardApi,
  deleteLeaderboard,
  createInvitation
} from '@/server/Main';

import {
  LoginButton,
  LogoutButton
} from '@/app/_components/AuthButtons';

import {
  CreateLeaderboardButton,
  DeleteLeaderboardButton,
  CreateInvitationButton
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
          <div className="rounded-md flex gap-2 flex-col items-center justify-center cursor-pointer border-black border-2 p-4">
            <a
              href={`/${leaderboard.id}`}
              className="hover:underline"
            >
              {leaderboard.name}
            </a>
            <p>Participants:</p>
            {leaderboard.participants.map((participant: any) => (
              <p key={participant.id}>{participant.display_name}</p>
            ))}
            {leaderboard.is_owner && (
              <div className="flex gap-2">
                <p>You are the owner of this leaderboard.</p>
                <DeleteLeaderboardButton deleteLeaderboard={async () => {
                  'use server';
                  await deleteLeaderboard(userid, leaderboard.id);
                  revalidatePath('/');
                }} />
                {leaderboard.invitation && (
                  <>
                    <p>Invitation link: {leaderboard.invitation.code}</p>
                    <p>Expires at: {leaderboard.invitation.expires_at}</p>
                  </>
                )}
                {!leaderboard.invitation && (
                  <div className="flex gap-2">
                    <p>No invitation link available.</p>
                    <CreateInvitationButton createInvitation={async () => {
                      'use server';
                      revalidatePath('/');
                      return await createInvitation(
                        userid,
                        leaderboard.id,
                        // TODO let user set expiration
                        'never'
                      );
                    }} />
                  </div>
                )}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
