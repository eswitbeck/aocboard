import { revalidatePath } from 'next/cache';
import { redirect as redirectFn } from 'next/navigation';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import { H1 } from '@/components/core/text';

import {
  getUserIdFromAccessToken,
  login,
} from '@/server/Main';

import {
  LoginButton,
} from '@/app/_components/AuthButtons';

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams;
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

  const href = !!redirectLocation
    ? `/create-account?redirect=${encodeURIComponent(redirectLocation)}`
    : '/create-account';
  return (
    <div className="flex flex-col gap-2 items-center mt-[34%] md:mt-[25%]">
      <H1>Log in</H1>
      <LoginButton login={loginCallback} />
      <Link
        href={href}
        className={twMerge(
          'text-gray-300',
          'text-lg',
          'rounded-2xl',
          'px-2 py-1',
          'border-2 border-gray-400',
          'focus:outline-none',
          'focus:ring-2 focus:ring-orange-500',
        )}
      >
        Register
      </Link>
    </div>
  );

}
