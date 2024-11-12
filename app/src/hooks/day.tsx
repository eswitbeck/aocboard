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
import { abort } from 'process';

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
    // at time of calling, time has NOT yet been updated from server
    // TODO find a way to get the new time before updating
    if (time.totalTime === 0) {
      setmilliSeconds(0);
    } else {
      const now = new Date();
      const startingDifference = time.totalTime +
        (time.lastTimestamp 
          ? now.getTime() - new Date(time.lastTimestamp).getTime()
          : 0);
      setmilliSeconds(startingDifference);
    }
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

const getTimesBuffer = (
  startTime: string | null,
  star_1_time: string | null,
  star_2_time: string | null,
  pauses: {
    start: string;
    end: string | null;
    start_id: number;
    end_id: number | null;
  }[]
) => {
  if (!startTime) {
    return null;
  }

  const timesBuffer = [{
    timestamp: startTime,
    type: 'start'
  }];

  const processedPauses = [];
  for (let i = 0; i < pauses.length; i++) {
    const pause = pauses[i];
    processedPauses.push({
      timestamp: pause.start,
      type: 'pause',
      id: pause.start_id
    });
    if (pause.end) {
      processedPauses.push({
        timestamp: pause.end,
        type: 'resume',
        id: pause.end_id
      });
    }
  }

  if (star_1_time) {
    timesBuffer.push({
      timestamp: star_1_time,
      type: 'star_1'
    });
  }

  if (star_2_time) {
    timesBuffer.push({
      timestamp: star_2_time,
      type: 'star_2'
    });
  }

  return timesBuffer
    .concat(processedPauses)
    .sort((a, b) => {
      return a.timestamp < b.timestamp ? -1 : 1;
    }) as {
      timestamp: string;
      type: 'start' | 'pause' | 'resume' | 'star_1' | 'star_2';
      id?: number;
    }[];
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
  ) => Promise<HTTPLike<void>>,
  updateLanguageApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number,
    languageId: number
  ) => Promise<HTTPLike<{ id: number }>>,
  updateSubmission: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number,
    field: 'link' | 'note',
    value: string
  ) => Promise<HTTPLike<{ value: string }>>,
  updateStartTimeApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number,
    timestamp: string
  ) => Promise<HTTPLike<{ timestamp: string }>>,
  updateStarTimeApi: (
    userId: number,
    day: number,
    year: number,
    leaderboard: number,
    timestamp: string,
    star: 'star_1' | 'star_2'
  ) => Promise<HTTPLike<{ timestamp: string }>>
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

  const timesBuffer = 
    !data
      ? null
      : getTimesBuffer(
          data?.body?.data?.start_time ?? null,
          data?.body?.data?.star_1_end_time ?? null,
          data?.body?.data?.star_2_end_time ?? null,
          (data?.body?.data?.pauses ?? [])
            .map((pause: {
              start_time: string | null;
              end_time: string | null;
              start_id: number;
              end_id: number | null;
            }) => ({
                start: pause.start_time,
                end: pause.end_time,
                start_id: pause.start_id,
                end_id: pause.end_id
              }))
        );

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
      leaderboard: number,
      ...args: any[]
    ) => Promise<HTTPLike<any>>,
    extras?: (() => void)[]
  ) => {

    return async (...args: any[]) => {
      if (!data) {
        return;
      }
      if (userId) {
        const response = await fn(userId, day, year, leaderboard, ...args);
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
    times: timesBuffer,
    clock,
    updateLanguage: wrapFn(updateLanguageApi),
    currentLanguage: data?.body?.data!.language ?? null,
    note: data?.body?.data!.note ?? null,
    updateNote: (note: string) =>
      wrapFn(updateSubmission)('note', note),
    link: data?.body?.data!.link ?? null,
    updateLink: (link: string) =>
      wrapFn(updateSubmission)('link', link),
    updateStartTime: wrapFn(updateStartTimeApi, [resetTime]),
    updateStarTime: wrapFn(updateStarTimeApi, [resetTime])
  };
}
