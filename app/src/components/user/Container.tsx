'use client';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

import { logout } from '@/server/Main';

import { timestamp2Timestamp } from '@/shared/utils';

import {
  useUser,
  useLeaderboards
} from '@/hooks/user';

import {
  UserIcon,
  Square2StackIcon,
  ArrowRightStartOnRectangleIcon,
  PlusIcon
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
  ) => Promise<HTTPLike<{
    code: string;
    expires_at: string;
  }>>
}) {

  const getClosestExpiration = (expiresAt: string): '1 day'
    | '1 week'
    | '1 month'
    | '1 year'
    | 'never'
    | 'now' => {
    const now = new Date();
    const expiresAtDate = new Date(expiresAt);

    if (expiresAtDate < now) {
      return 'now';
    } else if (expiresAtDate < new Date(
      now.getTime() + 1000 * 60 * 60 * 24
    )) {
      return '1 day';
    } else if (expiresAtDate < new Date(
      now.getTime() + 1000 * 60 * 60 * 24 * 7
    )) {
      return '1 week';
    } else if (expiresAtDate < new Date(
      now.getTime() + 1000 * 60 * 60 * 24 * 30
    )) {
      return '1 month';
    } else if (expiresAtDate < new Date(
      now.getTime() + 1000 * 60 * 60 * 24 * 365
    )) {
      return '1 year';
    } else {
      return 'never';
    }
  }

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
    updateInvitation,
    leaveLeaderboard
  } = useLeaderboards(
    userId,
    deleteLeaderboardApi,
    updateLeaderboardApi,
    createInvitationApi,
    updateInvitationApi,
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
          expires_at: string;
          code: string;
        } | null
      } | null
    >(null);
  const [editPage, setEditPage] = useState<'detail' | 'invitation'>('detail');

  const [nameBuffer, setNameBuffer] = useState<string | null>(null);
  const [noteBuffer, setNoteBuffer] = useState<string | null>(null);

  const expirationRef = useRef<HTMLSelectElement>(null);
  const [expirationBuffer, setExpirationBuffer] = useState('1 day');

  useEffect(() => {
    if (selectedLeaderboard) {
      setNameBuffer(selectedLeaderboard.name);
      setNoteBuffer(selectedLeaderboard.note);
      setExpirationBuffer(
        selectedLeaderboard.invitation
          ? getClosestExpiration(selectedLeaderboard.invitation.expires_at)
          : '1 day'
      );
    }
  }, [selectedLeaderboard]);

  const [copiedNoticeIsVisible, setCopiedNoticeIsVisible] =
    useState<boolean>(false);

  const [leaderboardToDelete, setLeaderboardToDelete] =
    useState<{
      id: number;
      participant_count: number;
      name: string
    } | null>(null);

  const [leaderboardToLeave, setLeaderboardToLeave] =
    useState<{
      id: number;
      name: string
    } | null>(null);

  return (
    <>
      <Modal
        isOpen={null !== leaderboardToLeave}
        close={() => { setLeaderboardToLeave(null); }}
      >
        <div className={twMerge(
          "flex flex-col gap-4",
          "px-6",
          "bg-gray-600",
          "rounded-lg"
        )}>
          <Base className="text-gray-300 text-xl mr-4">
            Are you sure you want to leave the leaderboard 
            {' '}
            <span className="text-gray-200 font-bold">
              {leaderboardToLeave?.name}
            </span>?
          </Base>
          <div className="flex gap-4 justify-end items-center">
            <button
              className={twMerge(
                "bg-gray-600 p-2 rounded-xl border-2 border-gray-700"
              )}
              onClick={() => { setLeaderboardToLeave(null); }}
            >
              <Base className="text-gray-800 font-bold">
                Cancel
              </Base>
            </button>
            <button
              className="bg-orange-500 p-2 rounded-xl min-w-16"
              onClick={() => {
                if (leaderboardToLeave) {
                  leaveLeaderboard(leaderboardToLeave.id);
                  setLeaderboardToLeave(null);
                }
              }}
            >
              <Base className="text-gray-700 font-bold">
                Leave
              </Base>
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={null !== selectedLeaderboard}
        close={() => {
          setSelectedLeaderboard(null);
          setNameBuffer(null);
          setNoteBuffer(null);
          setExpirationBuffer('1 day');
          setEditPage('detail');
        }}
        submit={
          editPage === 'detail' ?
            () => {
              setSelectedLeaderboard(null);
              setEditPage('detail');
              if (selectedLeaderboard && nameBuffer) {
                updateLeaderboard(selectedLeaderboard.id, 'name', nameBuffer);
              }
              if (selectedLeaderboard && noteBuffer) {
                updateLeaderboard(selectedLeaderboard.id, 'note', noteBuffer);
              }

              setNameBuffer(null);
              setNoteBuffer(null);
            }
          : undefined
        }
      >
        <div className={twMerge(
          "flex flex-col gap-2",
          "px-6",
        )}>
          <Base className="text-gray-300 text-xl mr-4">
            {selectedLeaderboard?.name}
          </Base>
          <div className="flex gap-4 mb-4">
            <button
              className={twMerge(
                "p-2 rounded-xl",
                editPage === 'detail' ? "bg-gray-800" : "bg-gray-700"
              )}
              onClick={() => { setEditPage('detail'); }}
            >
              <Base className={twMerge(
                "font-bold",
                editPage === 'detail' ? "text-gray-300" : "text-gray-500"
              )}>
                Detail
              </Base>
            </button>
            <button
              className={twMerge(
                "p-2 rounded-xl",
                editPage === 'invitation' ? "bg-gray-800" : "bg-gray-700"
              )}
              onClick={() => { setEditPage('invitation'); }}
            >
              <Base className={twMerge(
                "font-bold",
                editPage === 'invitation' ? "text-gray-300" : "text-gray-500"
              )}>
                Invitation
              </Base>
            </button>
          </div>
          {editPage === 'detail' ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Base className="text-gray-400">
                  Name
                </Base>
                <input
                  type="text"
                  className={twMerge(
                    "p-2 rounded-lg bg-gray-700",
                    "text-gray-300",
                    "focus:outline-none",
                    "focus:ring-2 ring-orange-500",
                    "placeholder-gray-500"
                  )}
                  value={nameBuffer || ''}
                  onChange={e => { setNameBuffer(e.target.value); }}
                  placeholder="Leaderboard Name"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Base className="text-gray-400">
                  Note
                </Base>
                <textarea
                  className={twMerge(
                    "p-2 rounded-lg bg-gray-700",
                    "text-gray-300",
                    "placeholder-gray-500",
                    "h-24",
                    "focus:outline-none",
                    "focus:ring-2 ring-orange-500"
                  )}
                  value={noteBuffer || ''}
                  onChange={e => { setNoteBuffer(e.target.value); }}
                  placeholder="Leaderboard Note"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Base className="text-gray-400">
                  Invitation Link
                </Base>
                <div className="flex gap-2 items-center">
                  <div
                    className={twMerge(
                      "flex gap-2 bg-gray-700 p-2 rounded-lg",
                      "min-w-36 h-10",
                      "items-center",
                      "justify-between",
                      selectedLeaderboard?.invitation && "cursor-pointer"
                    )}
                    onClick={() => {
                      if (selectedLeaderboard?.invitation) {
                        navigator.clipboard.writeText(
                          `${process.env.NEXT_PUBLIC_API_URL}` + 
                            `/j/${selectedLeaderboard.invitation.code}`
                        );

                        setCopiedNoticeIsVisible(true);
                        setTimeout(() => {
                          setCopiedNoticeIsVisible(false);
                        }, 2000);
                      }
                    }}
                  >
                    {selectedLeaderboard?.invitation ? (
                      <>
                        <Base className="text-gray-300 font-bold">
                          /j/{selectedLeaderboard.invitation.code}
                        </Base>
                        <Square2StackIcon className="h-6 w-6 text-gray-400" />
                      </>
                    ) : (
                      <Base className="text-gray-500 font-bold">
                        No link
                      </Base>
                    )}
                  </div>
                  {copiedNoticeIsVisible && (
                    <Base className="text-gray-400">
                      Copied!
                    </Base>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Base className="text-gray-400">
                  Expires in
                </Base>
                <select
                  className={twMerge(
                    "p-2 rounded-lg bg-gray-700",
                    "text-gray-300",
                    "focus:outline-none",
                    "focus:ring-2 ring-orange-500"
                  )}
                  ref={expirationRef}
                  value={expirationBuffer}
                  onChange={e => { setExpirationBuffer(e.target.value); }}
                >
                  <option value="1 day">1 day</option>
                  <option value="1 week">1 week</option>
                  <option value="1 month">1 month</option>
                  <option value="1 year">1 year</option>
                  <option value="never">never</option>
                  <option value="now">now (disabled)</option>
                </select>
                <button
                  className="border-2 border-gray-700 p-2 rounded-xl mt-3"
                  onClick={() => {
                    if (selectedLeaderboard) {
                      if (selectedLeaderboard.invitation) {
                        updateInvitation(
                          selectedLeaderboard.id,
                          expirationRef.current?.value as '1 day'
                            | '1 week'
                            | '1 month'
                            | '1 year'
                            | 'never'
                            | 'now'
                        );
                      } else {
                        createInvitation(
                          selectedLeaderboard.id,
                          expirationRef.current?.value as '1 day'
                            | '1 week'
                            | '1 month'
                            | '1 year'
                            | 'never',
                          selectedLeaderboard
                        );
                      }
                    }
                  }}
                >
                  <Base className="text-gray-800 font-bold">
                    {selectedLeaderboard?.invitation ? 'Update' : 'Create Link'}
                  </Base>
                </button>
              </div>
            </div>
          )}
        </div>
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
        <div className={twMerge(
          "flex gap-1 flex w-full h-full justify-center items-center"
        )}>
          <div
            className={twMerge(
              "flex gap-2 items-center border-2 border-gray-600 p-2 rounded-lg",
              "cursor-pointer"
            )}
            onClick={() => { logout(); }}
          >
            <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-gray-400" />
            <Base className="text-gray-400 font-bold"> 
              Logout
            </Base>
          </div>
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
                    <div className="flex gap-2 items-center">
                      {owner && (
                      <>
                        <Avatar
                          user={owner}
                          size="xs"
                        />
                        <Small className="text-gray-400">
                          {owner.display_name.slice(0, 10) +
                            (owner.display_name.length > 10 ? '...' : '')}
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
                  <div className={twMerge(
                    "bg-gray-700 p-2 rounded-lg w-full h-24 overflow-y-auto"
                  )}>
                    <Base className={twMerge(
                      "text-sm whitespace-pre-wrap",
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
                {!leaderboard.is_owner && (
                  <div className="w-full flex justify-end gap-5 mt-2">
                    <button
                      className={twMerge(
                        "border-2 border-gray-700 p-2 rounded-xl min-w-16",
                        "flex justify-between items-center"
                      )}
                      onClick={() => { setLeaderboardToLeave({
                        id: leaderboard.id,
                        name: leaderboard.name
                      }); }}
                    >
                      <Base className="text-gray-800 font-bold">
                        Leave
                      </Base>
                      <ArrowRightStartOnRectangleIcon className={twMerge(
                        "h-6 w-6 text-gray-800"
                      )}/>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {!leaderboards && (
            <div className={twMerge(
              "flex flex-col gap-2",
              "p-6",
              "bg-gray-600",
              "rounded-lg",
              "animate-pulse",
              "h-36"
            )}/>
          )}
          <button className={twMerge(
            "bg-gray-600 p-2 py-4",
            "flex gap-2 items-center justify-center",
            "mb-16"
          )}
            onClick={() => { createLeaderboard(); }}
          >
            <PlusIcon className="h-6 w-6 text-gray-400" />
            <Base className="text-gray-300 font-bold">
              Create a new leaderboard
            </Base>
          </button>
        </div>
      </div>
    </>
  );
}
