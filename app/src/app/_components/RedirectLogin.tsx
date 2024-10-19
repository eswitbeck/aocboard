'use client';

import { usePathname, redirect } from 'next/navigation';

export default function RedirectLogin() {
  const pathname = usePathname();
  redirect('/login?redirect=' + encodeURIComponent(pathname));

  return null;
}
