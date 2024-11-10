'use client';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

import {
  XMarkIcon
} from '@heroicons/react/20/solid';

import {
  useClock,
  useDay,
  SubmissionStatus
} from '@/hooks/day';

import {
  H3,
  Base,
  A
} from '@/components/core/text';

import Buttons from './Buttons';
import Clock from './Clock';
import Icons from './Icons';
import Stars from './Stars';

enum ModalState {
  None,
  Note,
  Link,
  Copy,
  Language,
  Clock
}

export default function Container({
  submissionResponse,
  userId,
  day,
  year,
  leaderboard,
  getSubmission,
  startSubmissionApi,
  claimStarApi,
  pauseSubmissionApi,
  resumeSubmssionApi,
  undoStarApi
}: {
  submissionResponse: GetSubmissionResponse;
  userId: number | null;
  day: number;
  year: number;
  leaderboard: number;
  getSubmission: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number
  ) => Promise<GetSubmissionResponse>;
  startSubmissionApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number
  ) => Promise<HTTPLike<Submission>>;
  claimStarApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number
  ) => Promise<HTTPLike<Submission>>;
  pauseSubmissionApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number
  ) => Promise<HTTPLike<{ time: number }>>;
  resumeSubmssionApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number
  ) => Promise<HTTPLike<{ time: number }>>;
  undoStarApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number
  ) => Promise<HTTPLike<void>>;
}) {
  const {
    status,
    iconsDisabled,
    totalTime,
    clockIsEditable,
    buttonStatus,
    clock
  } = useDay(
    submissionResponse,
    userId,
    day,
    year,
    leaderboard,
    getSubmission,
    startSubmissionApi,
    claimStarApi,
    pauseSubmissionApi,
    resumeSubmssionApi,
    undoStarApi
  );

  const [modalState, setModalState] = useState<ModalState>(ModalState.None);

  const close = () => setModalState(ModalState.None);


  return (
    <>
      <Modal isOpen={ModalState.Clock === modalState} close={close}>
        <div className={twMerge(
           "flex flex-col gap-4",
        )}>
          <H3 className="text-3xl !my-0">
            Set Times
          </H3>
        </div>
      </Modal>
      <Modal isOpen={ModalState.Copy === modalState} close={close}>
        <div className={twMerge(
           "flex flex-col gap-4",
        )}>
          <H3 className="text-3xl !my-0">
            Copy times
          </H3>
        </div>
      </Modal>
      <Modal isOpen={ModalState.Language === modalState} close={close}>
        <div className={twMerge(
           "flex flex-col gap-4",
        )}>
          <H3 className="text-3xl !my-0">
            Add Language
          </H3>
        </div>
      </Modal>
      <Modal isOpen={ModalState.Link === modalState} close={close}>
        <div className={twMerge(
           "flex flex-col gap-4",
        )}>
          <H3 className="text-3xl !my-0">
            Add link
          </H3>
        </div>
      </Modal>
      <Modal isOpen={ModalState.Note === modalState} close={close}>
        <div className={twMerge(
           "flex flex-col gap-4",
        )}>
          <H3 className="text-3xl !my-0">
            Add note
          </H3>
        </div>
      </Modal>
      <div className={twMerge(
        "flex flex-col gap-2",
        "w-full py-4"
      )}>
        <Stars stars={{
          star_1: !!totalTime.time_to_first_star,
          star_2: !!totalTime.time_to_second_star,
        }} />
        <Clock
          time={clock ?? '00:00:00'}
          isEditable={clockIsEditable}
          onClick={() => setModalState(ModalState.Clock)}
        />
        <Icons
          isDisabled={iconsDisabled}
          toggleCommentModal={() => setModalState(ModalState.Note)}
          toggleCopyModal={() => setModalState(ModalState.Copy)}
          toggleLanguageModal={() => setModalState(ModalState.Language)}
          toggleLinkModal={() => setModalState(ModalState.Link)}
        />
      </div>
      <div /> {/* spacer div */}
      <Buttons 
        disabled={buttonStatus.disabled}
        functions={buttonStatus.functions}
      />
    </>
  );
}

function Modal({
  children,
  isOpen,
  close
}: {
  children?: React.ReactNode,
  isOpen: boolean,
  close: () => void
}) {
  return (
      <div
        className={twMerge(
          "absolute left-0 top-0 w-full h-[100vh]",
          "overflow-hidden",
          "pointer-events-none",
        )}
      >
        <div
          className={twMerge(
            "absolute left-0 w-full h-full",
            "bg-gray-600",
            "rounded-t-xl",
            "z-20",
            "transition-all duration-300",
            "pointer-events-auto",
            "p-4",
          )}
          style={{
            top: isOpen ? '25%' : '100%',
          }}
        >
          <button
            className={twMerge(
              "absolute right-4 top-4",
              "bg-gray-700",
              "p-1 rounded-xl",
              "hover:bg-gray-500",
            )}
            onClick={close}
          >
            <XMarkIcon className="w-6 h-6 text-gray-200" />
          </button>
          {children}
        </div>
      </div>
  );
}
