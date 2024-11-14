'use client';
import {
  useState
} from 'react';
import useSWR from 'swr';

import {
  getSelf,
  getLeaderboards,
  createLeaderboard as createLeaderboardApi,
} from '@/server/Main';

export const useUser = (
  userId: number,
  updateAccount: (
    userId: number,
    field: 'link' | 'display_name',
    value: string
  ) => Promise<HTTPLike<{}>>
) => {
  const {
    data: self,
    error: selfError,
    isLoading: selfIsLoading,
    mutate: selfMutate
  } = useSWR<HTTPLike<User & { username: string }> | null>(
    [userId],
    async ([userId]) => {
      if (!userId) {
        return null;
      }
      return await getSelf(userId);
    }
  );

  const updateUser = async (
    field: 'link' | 'display_name',
    value: string
  ) => {
    if (!self?.body) {
      return;
    }
    const newUser = {
      ...self,
      body: {
        ...self.body,
        data: {
          ...self.body.data,
          [field]: value
        }
      }
    };
    await updateAccount(userId, field, value);
    selfMutate(null, {
      optimisticData: {
        ...self,
        body: {
          ...self.body,
          data: {
            ...self.body.data,
            [field]: value
          }
        },
        status: 200
      }
    });
  }

  return {
    self: self?.body?.data ?? null,
    selfError,
    selfIsLoading,
    updateUser
  };
}

export const useLeaderboards = (
  userId: number,
  deleteLeaderboardApi: (
    leaderboardId: number
  ) => Promise<HTTPLike<void>>,
  updateLeaderboardApi: (
    leaderboardId: number,
    field: 'name' | 'note',
    value: string
  ) => Promise<HTTPLike<{}>>,
  createInvitationApi: (
    leaderboardId: number,
    expiresAt: '1 day'
      | '1 week'
      | '1 month'
      | '1 year'
      | 'never'
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
) => {
  const {
    data: leaderboards,
    error: leaderboardsError,
    isLoading: leaderboardsIsLoading,
    mutate: leaderboardsMutate
  } = useSWR<HTTPLike<{
    id: number;
    name: string;
    is_owner: boolean;
    participants: {
      id: number;
      display_name: string;
      username: string;
      link: string | null;
      avatar_color: AvatarColor;
    }[];
    invitation: {
      code: string,
      expires_at: string
    } | null;
  }[]> | null>(
    [userId, 'leaderboards'],
    async ([userId, _]) => {
      if (!userId) {
        return null;
      }
      return await getLeaderboards(userId);
    }
  );

  const createLeaderboard = async () => {
    if (!userId) {
      return;
    }
    await createLeaderboardApi(userId);
    leaderboardsMutate();
  }

  const deleteLeaderboard = async (leaderboardId: number) => {
    // TODO maybe figure out optimistic updates
    await deleteLeaderboardApi(leaderboardId);
    leaderboardsMutate();
  }

  const updateLeaderboard = async (
    leaderboardId: number,
    field: 'name' | 'note',
    value: string
  ) => {
    // TODO maybe figure out optimistic updates
    await updateLeaderboardApi(leaderboardId, field, value);
    leaderboardsMutate();
  }

  const createInvitation = async (
    leaderboardId: number,
    expiresAt: '1 day'
      | '1 week'
      | '1 month'
      | '1 year'
      | 'never'
  ) => {
    // TODO maybe figure out optimistic updates
    await createInvitationApi(leaderboardId, expiresAt);
    leaderboardsMutate();
  }

  const updateInvitation = async (
    leaderboardId: number,
    expiresAt: '1 day'
      | '1 week'
      | '1 month'
      | '1 year'
      | 'never'
      | 'now'
  ) => {
    // TODO maybe figure out optimistic updates
    await updateInvitationApi(leaderboardId, expiresAt);
    leaderboardsMutate();
  }

  return {
    leaderboards: leaderboards?.body?.data ?? null,
    leaderboardsError,
    leaderboardsIsLoading,
    createLeaderboard,
    deleteLeaderboard,
    updateLeaderboard,
    createInvitation,
    updateInvitation
  };
}

  

