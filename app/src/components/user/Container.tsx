'use client';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';
import Link from 'next/link';

import { timestamp2Timestamp } from '@/shared/utils';

import {
  useUser,
  useLeaderboards
} from '@/hooks/user';

import {
  UserIcon
} from '@heroicons/react/24/outline';

import AccountSection from '@/components/user/AccountSection';
import Avatar from '@/components/shared/Avatar';
import Modal from '@/components/day/Modal';

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

  const [selectedLeaderboard, setSelectedLeaderboard] =
    useState< 
      {
        id: number,
        name: string,
        note: string | null,
        owner_id: number,
        participants: {
          id: number,
          display_name: string,
          username: string,
          link: string | null,
          avatar_color: AvatarColor
        }[],
        created_at: string,
        is_owner: boolean,
        invitation: {
          expires_at: string | null;
          code: string;
        }
      } | null
    >(null);

  const [leaderboardToDelete, setLeaderboardToDelete] =
    useState<{
      id: number;
      participant_count: number;
      name: string
    } | null>(null);

  return (
    <>
      <Modal
        isOpen={null !== selectedLeaderboard}
        close={() => { setSelectedLeaderboard(null); }}
        submit={() => {}}
      >
      </Modal>
      <Modal
        isOpen={null !== leaderboardToDelete}
        close={() => { setLeaderboardToDelete(null); }}
      >
        <div className={twMerge(
          "flex flex-col gap-4",
          "px-6",
          "bg-gray-600",
          "rounded-lg"
        )}>
          <Base className="text-gray-300 text-xl">
            Are you sure you want to delete the leaderboard 
            {' '}
            <span className="text-gray-200 font-bold">
              {leaderboardToDelete?.name}
            </span>?
          </Base>
          {(leaderboardToDelete?.participant_count ?? 0) > 1 ? (
            <Base className="text-gray-400">
            Doing so will also remove the board for all
              {' ' + leaderboardToDelete?.participant_count} participants.
            </Base>
          ) : null}
          <Base className="text-gray-400">
            This action cannot be undone.
          </Base>
          <div className="flex gap-4 justify-end items-center">
            <button
              className={twMerge(
                "bg-gray-600 p-2 rounded-xl border-2 border-gray-700"
              )}
              onClick={() => { setLeaderboardToDelete(null); }}
            >
              <Base className="text-gray-800 font-bold">
                Cancel
              </Base>
            </button>
            <button
              className="bg-red-500 p-2 rounded-xl min-w-16"
              onClick={() => {
                if (leaderboardToDelete) {
                  deleteLeaderboard(leaderboardToDelete.id);
                  setLeaderboardToDelete(null);
                }
              }}
            >
              <Base className="text-gray-700 font-bold">
                Delete
              </Base>
            </button>
          </div>
        </div>
      </Modal>
      <AccountSection
        self={self}
        updateUser={updateUser}
      />
      <div className={twMerge(
        'flex flex-col gap-4',
      )}>
        <div className="flex gap-3 flex-col w-full h-full">
          logout here
        </div>
      </div>
      <div className={twMerge(
        'flex flex-col gap-4',
      )}>
        <div className="px-8">
          <H3>Your Leaderboards</H3>
        </div>
        <div className="flex gap-3 flex-col w-full h-full">
          {leaderboards && leaderboards.map(leaderboard => {
            const owner = leaderboard.participants.find(
              participant => participant.id === leaderboard.owner_id
            );
            return (
              <div key={leaderboard.id} className={twMerge(
                "w-full",
                "p-6",
                "bg-gray-600",
                "flex gap-2 flex-col"
              )}>
                <div className="flex flex-col">
                  <Link href={`/${leaderboard.id}`} key={leaderboard.id}>
                    <Base className="text-xl underline mb-2">
                      {leaderboard.name}
                    </Base>
                  </Link>
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      {owner && (
                      <>
                        <Avatar
                          user={owner}
                          size="xs"
                          className="outline-gray-600"
                        />
                        <Small className="text-gray-400">
                          {owner.display_name}
                        </Small>
                      </>)}
                    </div>
                    <div className="flex gap-2 items-center mb-3">
                      <Small className="text-gray-400">
                        Created {new Date(
                          timestamp2Timestamp(leaderboard.created_at) as string
                        ).toLocaleDateString(
                          undefined,
                          { year: 'numeric', month: '2-digit', day: 'numeric' }
                        )}
                      </Small>
                      <Small className="text-gray-400">
                        |
                      </Small>
                      <div className="flex gap-1 items-center">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <Small className="text-gray-400">
                          {leaderboard.participants.length}
                        </Small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex w-full gap-2 justify-center items-center">
                  <div className="bg-gray-700 p-2 rounded-lg w-full h-24">
                    <Base className={twMerge(
                      "text-sm overflow-y-auto",
                      leaderboard.note ? "text-gray-300" : "text-gray-500"
                    )}>
                      {leaderboard.note || 'No note'} 
                    </Base>
                  </div>
                </div>
                {leaderboard.is_owner && (
                  <div className="w-full flex justify-end gap-5 mt-2">
                    <button
                      className={twMerge(
                        "bg-gray-600 p-2 rounded-xl border-2 border-gray-700"
                      )}
                      onClick={() => { setLeaderboardToDelete({
                        id: leaderboard.id,
                        participant_count: leaderboard.participants.length,
                        name: leaderboard.name
                      }); }}
                    >
                      <Base className="text-gray-800 font-bold">
                        Delete
                      </Base>
                    </button>
                    <button
                      className="bg-orange-500 p-2 rounded-xl min-w-16"
                      onClick={() => { setSelectedLeaderboard(leaderboard); }}
                    >
                      <Base className="text-gray-700 font-bold">
                        Edit
                      </Base>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
