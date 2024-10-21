import { redirect } from 'next/navigation';
import { registerUser } from '@/server/Main';

import CreateAccountButtons from '@/app/_components/CreateAccountButtons';

export default function Page() {

  const registerUserFn = async (username: string, password: string) => {
    'use server';
    await registerUser(username, password);
    redirect('/login');
  }

  return (
    <div>
      <CreateAccountButtons registerUser={registerUserFn} />
    </div>
  );
}

