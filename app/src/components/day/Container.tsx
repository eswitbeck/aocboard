'use client';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

import {
  CheckIcon
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

import LinkModal from './modals/Link';
import NoteModal from './modals/Note';
import LanguageModal from './modals/Language';
import TimeModal from './modals/Time';

import Modal from './Modal';

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
  undoStarApi,
  languages,
  updateLanguageApi,
  updateSubmission
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

  languages: { id: number, name: string }[];
  updateLanguageApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number,
    languageId: number
  ) => Promise<HTTPLike<{ id: number }>>;

  updateSubmission: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number,
    field: 'link' | 'note',
    value: string
  ) => Promise<HTTPLike<{ value: string }>>;
}) {
  const {
    status,
    iconsDisabled,
    totalTime,
    clockIsEditable,
    buttonStatus,
    clock,
    updateLanguage,
    currentLanguage,
    note,
    updateNote,
    link,
    updateLink,
    times
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
    undoStarApi,
    updateLanguageApi,
    updateSubmission
  );

  const [modalState, setModalState] = useState<ModalState>(ModalState.None);

  const close = () => setModalState(ModalState.None);

  return (
    <>
      <TimeModal
        isOpen={ModalState.Clock === modalState}
        close={close}
        times={times}
        updateStar={() => {}}
        updateStartTime={() => {}}
        updatePause={() => {}}
      />
      <Modal isOpen={ModalState.Copy === modalState} close={close}>
        <div className={twMerge(
           "flex flex-col gap-4",
        )}>
          <H3 className="text-3xl !my-0">
            Copy times
          </H3>
        </div>
      </Modal>
      <LanguageModal
        isOpen={ModalState.Language === modalState}
        close={close}
        currentLanguage={currentLanguage}
        languages={languages}
        updateLanguage={updateLanguage}
      />
      <LinkModal
        isOpen={ModalState.Link === modalState}
        close={close}
        currentLink={link}
        updateLink={updateLink}
      />
      <NoteModal
        isOpen={ModalState.Note === modalState}
        close={close}
        currentNote={note}
        updateNote={updateNote}
      />
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
