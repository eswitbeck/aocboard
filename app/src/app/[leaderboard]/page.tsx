import Link from 'next/link';

export default function Page({
  params: { leaderboard }
}: {
  params: { leaderboard: number }
}) {
  const years = Array.from(
    { length: new Date().getFullYear() - 2015 + 1 },
    (_, i) => i + 2015
  ).reverse();
  return (
    <div className="flex flex-col gap-4">
      {years.map((year) => (
        <Year key={year} year={year} leaderboard={leaderboard} />
      ))}
    </div>
  );
}

export function Year({
  year,
  leaderboard
}: {
  year: number,
  leaderboard: number
}) {
  const days = Array.from({ length: 25 }, (_, i) => i + 1);
  return (
    <div className="border-2 border-black rounded-lg p-4 flex flex-col gap-2 justify-center">
      <h2 className="text-2xl font-bold">{year}</h2>
      <div className="flex flex-col gap-1">
        {days.map((day) => (
          <Link key={day} href={`/${leaderboard}/${year}/${day}`}>
            <div key={day} className="w-full border-b-2 border-slate-200"> 
              {day}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
