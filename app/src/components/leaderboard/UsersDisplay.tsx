'use client';
import { twMerge } from 'tailwind-merge'
import {
  useState
} from 'react';
import {
  H1,
  H3,
  Base
} from '@/components/core/text';


export default function UsersDisplay({
  users
}: {
  // expects sorted from highest score to lowest
  users: UsersArray
}) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
  return (
    <>
    <div
      className={twMerge(
        "lg:hidden",
        "bg-gray-600 min-h-8 fixed w-full",
      )}
      style={{
        top: dropdownIsOpen ? "-100%" : "0",
        transition: "top 5s"
      }}
    />
    <div className={
      twMerge(
        "rounded-b-md w-full bg-gray-600 min-h-16",
        "shadow-md p-2 px-4",
        "flex justify-center items-center fixed",
        "lg:hidden",
      )}
      style={{
        top: dropdownIsOpen ? "-100%" : "0",
        animation: dropdownIsOpen
          ? "dropSlide 0.7s ease-in-out forwards"
          : "none",
      }}
    >
      <style>
        {`
        @keyframes dropSlide {
          0% {
            top: 0;
            transform: translateY(0);
          }
          20% {
            top: 0; 
            transform: translateY(10px);
          }
          100% {
            top: -100%;
          }
        }
        `}
      </style>
      <div className={
        twMerge(
          "w-full max-w-4xl bg-gray-700 min-h-12",
          "rounded-lg p-2",
          "flex"
        )}
        onClick={() => setDropdownIsOpen(!dropdownIsOpen)}
      >
        {users.map(({ id, display_name, score, link }, i) => (
          <div
            className={twMerge(
              "bg-red-500 rounded-full",
              "h-10 w-10",
              i !== 0 && "-ml-2",
              "border-4 border-red-900",
              "flex justify-center items-center",
              "outline-gray-700 outline"
            )}
            key={id}
          >
            <Base className="text-red-900 font-bold">
              {display_name[0].toUpperCase()}
            </Base>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
