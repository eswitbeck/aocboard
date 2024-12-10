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
  ) => Promise<void>
}) {


  const [editingSelfName, setEditingSelfName] = useState(false);
  const [editingSelfLink, setEditingSelfLink] = useState(false);

  return (
    <>
      {/* header if you want it */}
      <div className={twMerge(
        "flex flex-col gap-12 py-4 mt-[10%]",
        "items-center",
        "w-full"
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
                "text-lg",
                "h-8"
              )}>
                @{self.username}
              </Base>
              <div
                className={twMerge(
                  "cursor-pointer",
                  "flex justify-center items-center",
                  "rounded-2xl px-4 py-2",
                  "h-11 min-w-[244px]",
                  "bg-gray-600",
                  editingSelfName && "ring-2 ring-orange-500",
                  "overflow-x-scroll w-full",
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
                        {self.display_name.slice(0, 15) +
                          (self.display_name.length > 15 ? '...' : '')
                          || 'Add a display name'}
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
                  "w-full",
                  "h-11 min-w-[244px]",
                  "overflow-x-scroll",
                  "whitespace-nowrap"
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
                        {self.link && self.link.slice(0, 14) + 
                          (self.link.length > 15 ? '...' : '')
                          || 'Add a profile link'}
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
          "min-w-[244px]",
          "animate-pulse",
          "h-8"
        )}/>  
        <div
          className={twMerge(
            "flex justify-center items-center",
            "rounded-2xl px-4 py-2",
            "bg-gray-600",
            "min-w-[244px]",
            "animate-pulse",
            "h-11"
          )}
        />
        <div
          className={twMerge(
            "flex justify-center items-center",
            "rounded-2xl px-4 py-2",
            "bg-gray-600",
            "w-full",
            "animate-pulse",
            "h-11"
          )}
        />
      </div>
    </>
  );
}
