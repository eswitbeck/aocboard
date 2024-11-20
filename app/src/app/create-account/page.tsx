import { revalidatePath } from 'next/cache';
import { redirect as redirectFn } from 'next/navigation';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import { H1, Base, Small } from '@/components/core/text';

import {
  getUserIdFromAccessToken,
  registerUser,
  login,
  logout
} from '@/server/Main';

import LogoutButton
  from '@/components/create-account/LogoutButton';
import RegisterButtons from '@/components/create-account/RegisterButtons';


export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams;
  const userid = await getUserIdFromAccessToken();
  const isLoggedIn = userid !== null;
  if (isLoggedIn) {
    return <LoggedInPage />;
  } else {
    return <CreateAccountPage redirectLocation={redirect} />;
  }
}

function LoggedInPage({}) {
  return (
    <div className="flex flex-col gap-2 items-center mt-[34%] mx-12">
      <H1>Create Account</H1>
      <Base className="text-gray-300 text-lg text-center mb-12">
        You are already logged in. You&apos;ll need to log out to create a new account.
      </Base>
      <LogoutButton />
    </div>
  );
}


function CreateAccountPage({
  redirectLocation
}: {
  redirectLocation: string | undefined
}) {
  const loginCallback = async (
    username: string,
    password: string
  ) => {
    'use server';
    await registerUser(username, password);
    await login(username, password);
    redirectFn(redirectLocation || '/');
  }

  const href = !!redirectLocation
    ? `/login?redirect=${redirectLocation}`
    : '/login';

  return (
    <div className="flex flex-col gap-2 items-center mt-[34%]">
      <H1>Create Account</H1>
      <RegisterButtons register={loginCallback} />
      <Base className="text-gray-400 text-center mt-8">
        Already have an account?
      </Base>
      <Link
        href={href}
        className={twMerge(
          'text-gray-400',
          'text-lg',
          'border-2 border-gray-500',
          'rounded-2xl',
          'p-1 px-3',
          'hover:bg-gray-700',
          'hover:text-gray-300'
        )}
      >
        Log in
      </Link>
    </div>
  );
}
