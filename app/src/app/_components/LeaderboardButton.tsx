'use client';
export default function CreateLeaderboardButton({
  createLeaderboard
}: {
  createLeaderboard: () => Promise<void>
}) {
  return (
    <div
      className="w-20 h-10 rounded-md flex items-center justify-center cursor-pointer border-black border-2"
      onClick={() => createLeaderboard()}
    >
      +
    </div>
  );
}


