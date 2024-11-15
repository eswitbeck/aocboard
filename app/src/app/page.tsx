import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
  return (
    <div className="flex flex-col justify-center gap-4">
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
      <LogoutButton logout={handleLogout} />
    </div>
  );
}
