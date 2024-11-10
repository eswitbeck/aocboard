import { redirect } from 'next/navigation';
export default async function Page({
  params
}: {
  params: Promise<{ leaderboard: number }>
}) {
  const { leaderboard } = await params;
  redirect(`/${leaderboard}`);
}
