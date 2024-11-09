'use client';
import { twMerge } from 'tailwind-merge';

import {
  useDay,
  SubmissionStatus
} from '@/hooks/day';

import Buttons from './Buttons';
import Clock from './Clock';
import Icons from './Icons';
import Stars from './Stars';

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

  return (
    <>
      <div className={twMerge(
        "flex flex-col gap-2",
        "w-full py-4"
      )}>
        <Stars stars={{
          star_1: !!totalTime.time_to_first_star,
          star_2: !!totalTime.time_to_second_star,
        }} />
        <Clock time={totalTime} isEditable={clockIsEditable} />
        <Icons isDisabled={iconsDisabled} />
      </div>
      <div /> {/* spacer div */}
      <Buttons 
        disabled={buttonStatus.disabled}
        functions={buttonStatus.functions}
      />
    </>
  );
}
