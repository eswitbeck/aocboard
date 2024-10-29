'use client';
import { twMerge } from 'tailwind-merge'
import {
  useState
} from 'react';
import Link from 'next/link';

import {
  A,
  H1,
  H3,
  Base
} from '@/components/core/text';

import Avatar from '@/components/shared/Avatar';


export default function UsersDisplay({
  users,
  currentUser
}: {
  // expects sorted from highest score to lowest
  users: UsersArray,
  currentUser: {
    display_name: string,
    avatar_color: AvatarColor
  }
}) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
  return (
    <>
    <MobileDroppedDownHeader
      users={users}
      dropdownIsOpen={dropdownIsOpen}
      setDropdownIsOpen={setDropdownIsOpen}
    />
    <MobilePreviewHeader
      currentUser={currentUser}
      users={users}
      dropdownIsOpen={dropdownIsOpen}
      setDropdownIsOpen={setDropdownIsOpen}
    />
    </>
  );
}

function MobilePreviewHeader({
  currentUser,
  users,
  dropdownIsOpen,
  setDropdownIsOpen
}: {
  currentUser: {
    display_name: string,
    avatar_color: AvatarColor
  },
  users: UsersArray,
  dropdownIsOpen: boolean,
  setDropdownIsOpen: (arg0: boolean) => void
}) {
  return (
    <>
    <div className={twMerge(
        "rounded-b-md w-full bg-gray-600 min-h-16",
        "shadow-md p-2 px-4",
        "flex justify-center items-center gap-2", 
        "fixed",
        "lg:hidden",
        "z-10",
        "pt-[30px]", // for animation
      )}
      onClick={() => setDropdownIsOpen(true)}
      style={{
        animation: dropdownIsOpen
          ? "slideClosed 0.7s ease-in-out forwards"
          : "slideOpen 0.7s ease 0.3s forwards",
        transform: "translateY(-10px)",
      }}
    >
      <style>
        {`
        @keyframes slideClosed {
          0% {
            top: 0;
            transform: translateY(-10px);
          }
          20% {
            top: 0; 
            transform: translateY(0);
          }
          100% {
            top: -100%;
            transform: translateY(-10px);
          }
        }

        @keyframes slideOpen {
          0% {
            top: -100%;
            transform: translateY(-10px);
          }
          100% {
            top: 0;
            transform: translateY(-10px);
          }
        }
      `}
      </style>
      <Link href="/">
        <div className={twMerge(
          "flex justify-center items-center",
          "rounded-lg bg-gray-700 px-4 py-2",
          "w-11 h-11"
        )}>
          <Base className="text-xl font-bold">
            {'<'}
          </Base>
        </div>
      </Link>
      <div className={
        twMerge(
          "w-full max-w-4xl bg-gray-700 min-h-12",
          "rounded-lg p-2",
          "flex",
        )}
      >
        {users.map(({
          id,
          display_name,
          link,
          avatar_color
        }, i) => (
          <Avatar
            user={{ display_name, link, avatar_color }}
            className={twMerge(
              i !== 0 && "-ml-2",
              "outline-gray-700"
            )}
            key={id}
            size="md"
          />
        ))}
      </div>
      <Link href="/">
        <div className={twMerge(
          "flex justify-center items-center",
          "rounded-lg bg-gray-700 px-4 py-2",
          "w-11 h-11"
        )}>
          <Avatar
            size="sm"
            className="outline-gray-700"
            user={{
              display_name: currentUser.display_name,
              link: '/',
              avatar_color: currentUser.avatar_color
            }}
          />
        </div>
      </Link>
    </div>
    </>
  );
}

function MobileDroppedDownHeader ({
  users,
  dropdownIsOpen,
  setDropdownIsOpen
}: {
  users: UsersArray,
  dropdownIsOpen: boolean,
  setDropdownIsOpen: (arg0: boolean) => void
}) {
  const places = {
    '1': '🥇',
    '2': '🥈',
    '3': '🥉',
  } as Record<string, string>;
  return (
    <div
      className={twMerge(
        "lg:hidden",
        "bg-gray-600 min-h-[75%] fixed w-full",
        "rounded-b-md",
        "p-4",
        "overflow-y-auto",
        "shadow-md"
      )}
      style={{
        top: dropdownIsOpen ? "0" : "-100%",
        transition: "top 0.7s ease 0.3s",
        zIndex: 11 // to cover the preview header's flicker
      }}
      onClick={() => setDropdownIsOpen(false)}
    >
      {users.map(({
        id,
        display_name,
        link,
        score,
        avatar_color
      }, i) => (
        <div className={twMerge(
          i === 0 ? "mt-[15px]" : "", // for header
          "grid grid-cols-10 gap-2",
          "items-center"
        )} key={id}>
          <div className={twMerge(
            "col-span-1",
            "flex justify-center items-center"
          )}>
            {places[i + 1] ? (
              <Base className="text-2xl">
                {places[i + 1]}
              </Base>
            ) :
            (<Base className="text-gray-300 text-2xl">
              {i + 1}
            </Base>)
            }
          </div>
          <div
            className={twMerge(
              "flex justify-between items-center",
              "bg-gray-700 rounded-lg p-2",
              "mb-2",
              "col-span-9"
            )}
          >
            <Avatar
              user={{ display_name, link, avatar_color }}
              size="lg"
              className="outline-gray-700"
            />
            <div className={twMerge(
              "flex flex-col gap-2 justify-between",
              "items-end"
            )}>
              {link ? (
                <A
                  href={link}
                  className={twMerge(
                    "text-2xl"
                  )}
                >
                  {display_name}
                </A>
              )
              : 
              <H3 className="text-gray-200 text-2xl my-0">
                {display_name}
              </H3>
              }
              <Base className="text-gray-300 text-xl">
                {score}
              </Base>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
