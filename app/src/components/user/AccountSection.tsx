'use client';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

import {
  PencilIcon
} from '@heroicons/react/24/outline';

import {
  H1, H3, A, Base, Small
} from '@/components/core/text';

import Avatar from '@/components/shared/Avatar';


export default function AccountSection({
  self,
  updateUser
}: {
  self: (User & { username: string }) | null,
  updateUser: (
    field: 'link' | 'display_name',
    value: string | null
  ) => Promise<HTTPLike<void>>
}) {


  const [editingSelfName, setEditingSelfName] = useState(false);
  const [editingSelfLink, setEditingSelfLink] = useState(false);

  return (
    <>
      {/* header if you want it */}
      <div className={twMerge(
        "flex flex-col gap-12 py-4 mb-8 mt-[10%]",
        "items-center"
      )}>
          <div className={twMerge(
            "flex flex-col gap-3",
            "items-center"
          )}>
          {self && (<>
            <Avatar
              user={self}
              size="3xl"
            />
            <div className={twMerge(
              "flex flex-col gap-3",
              "items-start"
            )}>
              <Base className={twMerge(
                "text-gray-400",
                "text-lg"
              )}>
                @{self.username}
              </Base>
              <div
                className={twMerge(
                  "cursor-pointer",
                  "flex justify-center items-center",
                  "rounded-2xl px-4 py-2",
                  "bg-gray-600",
                  editingSelfName && "ring-2 ring-orange-500",
                  "min-w-[60vw]",
                  "overflow-x-scroll"
                )}
              >
                {!editingSelfName && (
                  <>
                    <div
                      onClick={() => {
                        setEditingSelfName(!editingSelfName);
                      }}
                      className={twMerge(
                        "flex items-center",
                        "justify-between",
                        "w-full"
                      )}
                    >
                      <Base className={twMerge(
                        "text-xl",
                        "font-bold"
                      )}>
                        {self.display_name || 'Add a display name'}
                      </Base>
                      <PencilIcon
                        className={twMerge(
                          "w-6 h-6",
                          "ml-2",
                          "text-gray-300"
                        )}
                      />
                    </div>
                  </>
                )}
                {editingSelfName && (
                  <Base>
                    <input
                      type="text"
                      className={twMerge(
                        "text-xl",
                        "font-bold",
                        "bg-gray-600",
                        "outline-none",
                      )}
                      placeholder="Add a display name"
                      defaultValue={self.display_name}
                      onBlur={(e) => {
                        updateUser(
                          'display_name',
                          e.target.value
                        );
                        setEditingSelfName(false);
                      }}
                    />
                  </Base>
                )}
              </div>
              <div
                className={twMerge(
                  "cursor-pointer",
                  "flex justify-center items-center",
                  "rounded-2xl px-4 py-2",
                  "bg-gray-600",
                  editingSelfLink && "ring-2 ring-orange-500",
                  "min-w-[60vw]"
                )}
              >
                {!editingSelfLink && (
                  <>
                    <div
                      onClick={() => {
                        setEditingSelfLink(!editingSelfLink);
                      }}
                      className={twMerge(
                        "flex items-center",
                        "justify-between",
                        "w-full"
                      )}
                    >
                      <Base className={twMerge(
                        "text-lg",
                        "font-bold",
                        "text-gray-300",
                        !self.link && "text-gray-500"
                      )}>
                        {self.link || 'Add a profile link'}
                      </Base>
                      <PencilIcon
                        className={twMerge(
                          "w-6 h-6",
                          "ml-2",
                          "text-gray-300",
                          !self.link && "text-gray-400"
                        )}
                      />
                    </div>
                  </>
                )}
                {editingSelfLink && (
                  <Base>
                    <input
                      type="text"
                      className={twMerge(
                        "text-lg",
                        "font-bold",
                        "bg-gray-600",
                        "outline-none",
                        "text-gray-300"
                      )}
                      defaultValue={self.link ?? ''}
                      placeholder="Add a profile link"
                      onBlur={(e) => {
                        updateUser(
                          'link',
                          e.target.value || null
                        );
                        setEditingSelfLink(false);
                      }}
                    />
                  </Base>
                )}
              </div>
            </div>
          </>)}
          {!self && (
            <ProfileSkeleton />
          )}
          </div>
      </div>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <div className={twMerge(
        "flex justify-center items-center",
        "rounded-full",
        "bg-gray-600",
        "w-36 h-36",
        "animate-pulse"
      )}/>
      <div className={twMerge(
        "flex flex-col gap-3",
        "items-start"
      )}>
        <div className={twMerge(
          "flex justify-center items-center",
          "rounded-2xl px-4 py-2",
          "bg-gray-600",
          "min-w-[60vw]",
          "animate-pulse",
          "h-8"
        )}/>  
        <div
          className={twMerge(
            "flex justify-center items-center",
            "rounded-2xl px-4 py-2",
            "bg-gray-600",
            "min-w-[60vw]",
            "animate-pulse",
            "h-11"
          )}
        />
        <div
          className={twMerge(
            "flex justify-center items-center",
            "rounded-2xl px-4 py-2",
            "bg-gray-600",
            "min-w-[60vw]",
            "animate-pulse",
            "h-11"
          )}
        />
      </div>
    </>
  );
}
