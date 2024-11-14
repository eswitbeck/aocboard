'use client';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

import {
  useUser,
  useLeaderboards
} from '@/hooks/user';

import {
  H1, H3, A, Base, Small
} from '@/components/core/text';

import Avatar from '@/components/shared/Avatar';

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
    value: string
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

  const [editingSelfName, setEditingSelfName] = useState(false);
  const [editingSelfLink, setEditingSelfLink] = useState(false);

  return (
    <>
      {/* header if you want it */}
      <div className={twMerge(
        "flex flex-col gap-12 py-4 mb-8 mt-[10%]",
      )}>
        {self && (
          <>
            <Avatar
              user={
                self
              }
              size="3xl"
            />
            {!editingSelfName && (
              <div onClick={() => {
                setEditingSelfName(true);
              }}>
                <H1>
                  {self.display_name}
                  <br/>
                  {self.username}
                </H1>
              </div>
            )}
            {editingSelfName && (
              <Base>
                <input
                  type="text"
                  value={self.display_name}
                  onChange={(e) => {
                    updateUser('display_name', e.target.value);
                  }}
                  onBlur={() => {
                    setEditingSelfName(false);
                  }}
                />
              </Base>
            )}
            {!editingSelfLink && (
              <Small>
                <Base>
                  {self.link}
                </Base>
              </Small>
            )}
          </>
        )}
      </div>
    </>
  );
}
