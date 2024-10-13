import { redirect } from 'next/navigation';
export default function Page({
  params: { leaderboard }
}: {
  params: { leaderboard: number }
}) {
  redirect(`/${leaderboard}`);
}
