import { revalidatePath } from 'next/cache';

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
    return <Login />;
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

function Login() {
  const loginCallback = async (username: string, password: string) => {
    'use server';
    await login(username, password);
    revalidatePath('/');
  }
  return <LoginButton login={loginCallback} />;
}
