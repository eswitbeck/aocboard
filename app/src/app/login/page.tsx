import { revalidatePath } from 'next/cache';
import { redirect as redirectFn } from 'next/navigation';

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

export default async function Page({
  searchParams: { redirect }
}: {
  searchParams: { redirect?: string }
}) {
  const userid = await getUserIdFromAccessToken();
  const isLoggedIn = userid !== null;
  if (!isLoggedIn) {
    return <Login redirectLocation={redirect} />;
  }

  redirectFn(redirect || '/');

  return null;
}

function Login({
  redirectLocation
}: {
  redirectLocation: string | undefined
}) {
  const loginCallback = async (
    username: string,
    password: string
  ) => {
    'use server';
    await login(username, password);
    redirectFn(redirectLocation || '/');
  }
  return <LoginButton login={loginCallback} />;
}
