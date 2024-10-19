import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  getUserIdFromAccessToken,
  refreshAccessToken,
  login,
  logout,
  registerUser
} from '@/server/Main';

import {
  LoginButton,
  LogoutButton
} from '@/app/_components/AuthButtons';

export default async function Page() {
  const userid = await getUserIdFromAccessToken();
  const isLoggedIn = userid !== null;
  if (!isLoggedIn) {
    redirect('/login');
  }

  const handleLogout = async () => {
    'use server';
    await logout();
    revalidatePath('/');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, # {userid}!</p>
      <LogoutButton logout={handleLogout} />
    </div>
  );
}
