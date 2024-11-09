'use client';
import {
  useState,
  useEffect,
  useRef
} from 'react';
import useSWR from 'swr';

import {
  timestamp2Clock
} from '@/shared/utils';

export const useClock = (
  time: TotalTime
) => {
  const now = new Date();
  const startingDifference = time.totalTime +
    (time.lastTimestamp 
      ? now.getTime() - new Date(time.lastTimestamp).getTime()
      : 0);

  const ref = useRef<number>(startingDifference);

  const [milliseconds, setmilliSeconds] = useState<number>(
    startingDifference
  );

  useEffect(() => {
    ref.current = milliseconds;
  }, [milliseconds, time]);

  useEffect(() => {
    if (time.lastTimestamp) {
      const interval = setInterval(() => {
        setmilliSeconds(ref.current + 1000);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [time]);

  const resetTime = () => {
    setmilliSeconds(0);
  }

  return {
    clock: timestamp2Clock(milliseconds),
    resetTime
  };
}

export enum SubmissionStatus {
  PRE_START,
  ACTIVE,
  PAUSED,
  COMPLETE
} 

const getStatus = (
  submissionResponse: GetSubmissionResponse | undefined
): SubmissionStatus => {
  if (!submissionResponse || 404 === submissionResponse.status) {
    return SubmissionStatus.PRE_START;
  } else if (submissionResponse.body?.data!.star_2_end_time !== null) {
    return SubmissionStatus.COMPLETE;
  } else if (Object.hasOwn(
    submissionResponse.body?.total_time,
    'lastTimestamp'
  )) {
    return SubmissionStatus.ACTIVE;
  } else {
    return SubmissionStatus.PAUSED;
  }
}

const getButtonStatus = (
  status: SubmissionStatus,
  claimStar: () => Promise<void>,
  beginSubmission: () => Promise<void>,
  pauseSubmission: () => Promise<void>,
  resumeSubmission: () => Promise<void>,
  undoStar: () => Promise<void>
) => {
  const fillerFn = async () => {};
  return {
    [SubmissionStatus.PRE_START]: {
      disabled: {
        undo: true,
        star: true,
        pause: false
      },
      functions: {
        undo: fillerFn,
        star: fillerFn,
        pause: beginSubmission,
        isPause: false
      }
    },
    [SubmissionStatus.ACTIVE]: {
      disabled: {
        undo: false,
        star: false,
        pause: false
      },
      functions: {
        undo: undoStar,
        star: claimStar,
        pause: pauseSubmission,
        isPause: true
      }
    },
    [SubmissionStatus.PAUSED]: {
      disabled: {
        undo: false,
        star: true,
        pause: false
      },
      functions: {
        undo: undoStar,
        star: fillerFn,
        pause: resumeSubmission,
        isPause: false,
      }
    },
    [SubmissionStatus.COMPLETE]: {
      disabled: {
        undo: false, 
        star: true,
        pause: true
      },
      functions: {
        undo: undoStar,
        star: fillerFn,
        pause: fillerFn,
        isPause: false
      }
    }
  }[status];
}

export const useDay = (
  submissionResponse: GetSubmissionResponse,
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number,
  getSubmission: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number
  ) => Promise<GetSubmissionResponse>,
  startSubmissionApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number
  ) => Promise<HTTPLike<Submission>>,
  claimStarApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number
  ) => Promise<HTTPLike<Submission>>,
  pauseSubmissionApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number
  ) => Promise<HTTPLike<{ time: number }>>,
  resumeSubmssionApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number
  ) => Promise<HTTPLike<{ time: number }>>,
  undoStarApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number
  ) => Promise<HTTPLike<void>>
) => {
  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR(
    [leaderboard, day, year, userId],
    async ([leaderboard, day, year, userId]) => {
      if (userId) {
        return await getSubmission(userId, day, year, leaderboard);
      }
    },
    {
      fallbackData: submissionResponse
    }
  );

  const status = getStatus(data);
  const iconsDisabled = SubmissionStatus.PRE_START === status;

  const totalTime = data?.body?.total_time ?? {
    totalTime: 0,
    time_to_first_star: null,
    time_to_second_star: null
  };
  const clockIsEditable = SubmissionStatus.PRE_START !== status;
  const {
    clock,
    resetTime
  } = useClock(totalTime);

  // TODO ideally done more sophisticatedly with optimistic update
  const wrapFn = (
    fn: (
      userId: number,
      day: number,
      year: number,
      leaderboard: number
    ) => Promise<HTTPLike<any>>,
    extras?: (() => void)[]
  ) => {
    return async () => {
      if (!data) {
        return;
      }
      if (userId) {
        const response = await fn(userId, day, year, leaderboard);
        if (300 > response.status) {
          mutate();
          if (extras) {
            extras.forEach(extra => extra());
          }
        }
      }
    }
  }

  const buttonStatus = getButtonStatus(
    status,
    wrapFn(claimStarApi),
    wrapFn(startSubmissionApi),
    wrapFn(pauseSubmissionApi),
    wrapFn(resumeSubmssionApi),
    wrapFn(undoStarApi, [() => {
      if (null === totalTime.time_to_first_star) {
        resetTime();
      }
    }])
  );

  return {
    status,
    iconsDisabled,
    clockIsEditable,
    buttonStatus,
    totalTime,
    clock
  };
}
