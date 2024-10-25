import { twMerge } from 'tailwind-merge'
import { H1, H3, Base } from '@/components/core/text';

export default function ErrorPage({
  usersResponse,
  leaderboardInfoResponse
}: {
  usersResponse: { status: number, error?: string },
  leaderboardInfoResponse: { status: number, error?: string }
}) {
  return (
    <div className="flex justify-center h-screen p-4">
      <div className="flex flex-col gap-4 mt-32 mx-4">
        <div className={twMerge(
          "py-4 rounded-xl flex flex-col gap-4",
          "border-2 border-gray-600"
        )}>
          <div className={twMerge(
            "border-y-2 border-orange-800 p-4 bg-orange-700"
          )}>
            <H1 className="text-orange-100">Mea culpa!</H1>
            <Base className="text-orange-200">
              Something went wrong. Mea maxima culpa.
            </Base>
          </div>
          <div className="flex flex-col gap-4 px-4">
            <Base className="text-gray-400">
              You can bother me about this. I may or may not have time to fix it.
            </Base>
            <div className={twMerge(
              "flex flex-col gap-2 rounded-xl bg-gray-800 p-2",
              "max-h-64 overflow-y-auto"
            )}>
              {usersResponse?.error && (
                <>
                  <H3>Users:</H3>
                  <Base className="text-gray-300">
                    {usersResponse.error}
                  </Base>
                </>
              )}
              {leaderboardInfoResponse?.error && (
                <>
                  <H3>Leaderboard Info:</H3>
                  <Base className="text-gray-300">
                    {leaderboardInfoResponse.error}
                  </Base>
                </>
              )}
            </div>
          </div>
      </div>
    </div>
  </div>
  );
}
