import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import {
  getSelf as getSelfApi,

  getUserIdFromAccessToken,
  logout,
  getAccountData,
  getLeaderboards,
  createLeaderboard as createLeaderboardApi,
  deleteLeaderboard,
  createInvitation,
  updateLeaderboard,
  updateAccount,
  updateInvitation
} from '@/server/Main';

import {
  LogoutButton
} from '@/app/_components/AuthButtons';

import InvitationUpdate from '@/app/_components/InvitationUpdate';
import LeaderboardUpdate from '@/app/_components/LeaderboardUpdate';

import {
  CreateLeaderboardButton,
  DeleteLeaderboardButton,
  CreateInvitationButton
} from '@/app/_components/LeaderboardButtons';

import Container from '@/components/user/Container';

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

  const wrapFn = (
    fn: (...arg0: any[]) => Promise<HTTPLike<any>>,
    extras?: (() => void)[]
  ) => {
    return async (...args: any[]) => {
      'use server';
      const response = await fn(...args);
      if (300 > response.status) {
        if (extras) {
          extras.forEach(extra => extra());
        }
      }

      return response;
    }
  }

  const wrapLeaderboardFn = (
    fn: (
      userId: number,
      leaderboardId: number,
      ...args: any[]
    ) => Promise<HTTPLike<any>>
  ) => {
    return async (leaderboardId: number, ...args: any[]) => {
      'use server';
      const response = await fn(userid, leaderboardId, ...args);
      if (300 > response.status) {
        revalidatePath(`/${leaderboardId}`);
      }

      return response;
    }
  }

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
      <LogoutButton logout={handleLogout} />
      <Container
        userId={userid}
        updateAccount={wrapFn(updateAccount, [async () => {
          'use server';
          revalidatePath('/[leaderboard]', 'layout');
        }])}
        deleteLeaderboardApi={wrapLeaderboardFn(deleteLeaderboard)}
        updateLeaderboardApi={wrapLeaderboardFn(updateLeaderboard)}
        createLeaderboardApi={createLeaderboardApi}
        updateInvitationApi={wrapLeaderboardFn(updateInvitation)}
        createInvitationApi={wrapLeaderboardFn(createInvitation)}
      />
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
              <div className="flex gap-2 flex-col">
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
                <InvitationUpdate
                  updateInvitation={async (
                    expiresAt: '1 day' | '1 week' | '1 month' | '1 year' | 'never' | 'now'
                  ) => {
                    'use server';
                    await updateInvitation(
                      userid,
                      leaderboard.id,
                      expiresAt
                    );
                    revalidatePath('/');
                  }}
                />
                <LeaderboardUpdate updateLeaderboard={async (
                  field: 'name' | 'note',
                  value: string
                ) => {
                  'use server';
                  await updateLeaderboard(
                    userid,
                    leaderboard.id,
                    field,
                    value
                  );
                  revalidatePath('/');
                }} />

              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
