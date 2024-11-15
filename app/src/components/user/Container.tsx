'use client';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';
import Link from 'next/link';

import {
  useUser,
  useLeaderboards
} from '@/hooks/user';

import AccountSection from '@/components/user/AccountSection';
import Avatar from '@/components/shared/Avatar';

import {
  H1, H3, A, Base, Small
} from '@/components/core/text';

export default function Container({
  userId,
  updateAccount,
  deleteLeaderboardApi,
  updateLeaderboardApi,
  createLeaderboardApi,
  updateInvitationApi,
  createInvitationApi,
}: {
  userId: number,
  updateAccount: (
    userId: number,
    field: 'link' | 'display_name',
    value: string | null
  ) => Promise<HTTPLike<{}>>,
  deleteLeaderboardApi: (
    leaderboardId: number
  ) => Promise<HTTPLike<void>>,
  updateLeaderboardApi: (
    leaderboardId: number,
    field: 'name' | 'note',
    value: string
  ) => Promise<HTTPLike<{}>>,
  createLeaderboardApi: (
    userId: number
  ) => Promise<HTTPLike<{}>>,
  updateInvitationApi: (
    leaderboardId: number,
    expiresAt: '1 day'
      | '1 week'
      | '1 month'
      | '1 year'
      | 'never'
      | 'now'
  ) => Promise<HTTPLike<{}>>,
  createInvitationApi: (
    leaderboardId: number,
    expiresAt: '1 day'
      | '1 week'
      | '1 month'
      | '1 year'
      | 'never'
  ) => Promise<HTTPLike<{}>>
}) {

  const {
    self,
    selfError,
    selfIsLoading,
    updateUser
  } = useUser(
    userId,
    updateAccount
  );

  const {
    leaderboards,
    leaderboardsError,
    leaderboardsIsLoading,
    createLeaderboard,
    deleteLeaderboard,
    updateLeaderboard,
    createInvitation,
    updateInvitation
  } = useLeaderboards(
    userId,
    deleteLeaderboardApi,
    updateLeaderboardApi,
    createInvitationApi,
    updateInvitationApi
  );

  return (
    <>
      <AccountSection
        self={self}
        updateUser={updateUser}
      />
      <div className={twMerge(
        'flex flex-col gap-4',
      )}>
        <div className="px-8">
          <H3>Your Leaderboards</H3>
        </div>
        <div className={twMerge(
          "w-full bg-gray-600",
          "h-[35vh]",
          "px-8 py-2",
        )}>
          <div className="flex gap-2 overflow-y-scroll w-full h-full">
            {leaderboards && leaderboards.map(leaderboard => (
              <Link href={`/${leaderboard.id}`} key={leaderboard.id}>
                <div key={leaderboard.id} className={twMerge(
                  "min-w-[47vw]",
                  "h-full",
                  "p-2",
                  "rounded-md",
                  "border-2 border-gray-500",
                  "flex gap-2 flex-col"
                )}>
                  <Base className="text-center text-lg">
                    {leaderboard.name}
                  </Base>
                  {leaderboard.is_owner && (
                    <Small className="text-gray-400">
                      (owner)
                    </Small>
                  )}
                  <Small className="text-gray-400">
                  </Small>
                  <div className={twMerge(
                    "flex gap-2 flex-col max-h-[50%] overflow-scroll",
                    "p-2",
                  )}>
                    {leaderboard.participants.map(participant => (
                      <div className="flex justify-between" key={participant.id}>
                        <Avatar
                          user={participant}
                          size="xs"
                          className="outline-gray-600"
                        />
                        <Base className="text-gray-400">
                          {participant.display_name}
                        </Base>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
            <div className={twMerge(
              "min-w-[47vw]",
              "h-full",
              "p-2",
              "rounded-md",
              "border-2 border-gray-500",
              "flex gap-2 flex-col"
            )}>
              <Base className="text-center text-lg">
                Create a new leaderboard
              </Base>
              <button
                onClick={createLeaderboard}
                className={twMerge(
                  "bg-blue-500",
                  "hover:bg-blue-600",
                  "text-white",
                  "rounded-md",
                  "p-2",
                  "text-center"
                )}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
