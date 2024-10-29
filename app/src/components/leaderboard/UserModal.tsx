'use client';
import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge'

import {
  timestamp2Clock,
  orderNumeral
} from '@/shared/utils';

import {
  Base,
	Small,
	H1,
	H3,
	A
} from '@/components/core/text';

import Avatar from '@/components/shared/Avatar';

export default function UserModal({
  userId,
  getSubmission,
  setSubmissionFetcher,
  userMap
}: {
  userId: number;
  getSubmission: EmptySubmissionFetcher;
  setSubmissionFetcher: (arg0: EmptySubmissionFetcher | null) => void;
  userMap: LeaderboardUserMap;
}) {
  const [submissionResp, setSubmissionResp] = useState<
    HTTPLike<Submission | null> & { body?: { total_time: TotalTime } } | null
  >(null);

  useEffect(() => {
    // disable scrolling
    document.body.classList.add('overflow-hidden');
    document.body.classList.add('relative');

    return () => {
      // enable scrolling
      document.body.classList.remove('overflow-hidden');
      document.body.classList.remove('relative');
    };
  }, []);

  useEffect(() => {
    (async () => {
      const response = await getSubmission();
      setSubmissionResp(response);
    })();
  }, [getSubmission, setSubmissionResp]);

  if (!submissionResp) {
    return null;
  }

  if (submissionResp.status === 404) {
    return <EmptyModal
      userId={userId}
      setSubmissionFetcher={setSubmissionFetcher}
      userMap={userMap}
    />;
  }
  
  const submission = submissionResp.body!.data;
  const totalTime = submissionResp.body!.total_time;

  if (!submission || !totalTime) {
    return null;
  }

  return (
    <div
      className={twMerge(
        'fixed inset-0 bg-gray-900 bg-opacity-50',
        'flex justify-center items-center z-50'
      )}
      onClick={() => setSubmissionFetcher(null)}
    >
      <div
        className={twMerge(
          'bg-gray-700 rounded-lg',
          'p-4',
          'max-w-[90%]'
        )}
      >
        <div className={twMerge(
          'flex gap-8 items-center',
          'border-b border-gray-600 pb-4 mb-4'
        )}>
          <Avatar
            user={userMap[submission.user_id]}
            size='lg'
            className="outline-gray-700"
          />
          <div className={twMerge(
            'flex flex-col'
          )}>
            {userMap[submission.user_id].link ? (
              <A
                href={userMap[submission.user_id].link}
                className="text-gray-200 font-bold text-2xl py-4 mb-2"
              >
                {userMap[submission.user_id].display_name}
              </A>
            )
            : (
              <H1 className="mb-2">
                {userMap[submission.user_id].display_name}
              </H1>
            )}
            <div className={twMerge(
              'flex gap-2'
            )}>
              {submission.link ? (
                <A href={submission.link} className="text-sm text-gray-400">
                   code
                </A>
              ) : (
                <Small className="text-gray-500">
                  no link
                </Small>
              )}
              <Small className={twMerge(
                !submission.language && !submission.link
                  ? "text-gray-500"
                  : "text-gray-400"
              )}>
                ·
              </Small>
              {submission.language ? (
                <Small className="text-gray-400">
                  {submission.language}
                </Small>
              ) : (
                <Small className="text-gray-500">
                  no language
                </Small>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <StarRow
            score={submission.star_1_score}
            index={submission.star_1_index}
            time={totalTime.time_to_first_star}
            starNumber={1}
          />
          <StarRow
            score={submission.star_2_score}
            index={submission.star_2_index}
            time={totalTime.time_to_second_star}
            starNumber={2}
          />
        </div>

        <div className={twMerge(
          'bg-gray-800 rounded-lg p-4 mb-4',
          'max-h-32',
          'overflow-auto'
        )}>
          <Base className={twMerge(
            submission.note
              ? "text-gray-400"
              : "text-gray-500"
          )}>
            {submission.note ?? "No note"}
          </Base>
        </div>
      </div>
    </div>
  );
}

function EmptyModal({
  userId,
  setSubmissionFetcher,
  userMap
}: {
  userId: number;
  setSubmissionFetcher: (arg0: EmptySubmissionFetcher | null) => void;
  userMap: LeaderboardUserMap;
}) {
  return (
    <div
      className={twMerge(
        'fixed inset-0 bg-gray-900 bg-opacity-50',
        'flex justify-center items-center z-50'
      )}
      onClick={() => setSubmissionFetcher(null)}
    >
      <div className={twMerge(
        'bg-gray-700 rounded-lg',
        'p-4'
      )}>
        <div className={twMerge(
          'flex gap-8 items-center',
          'border-b border-gray-600 pb-4 mb-4'
        )}>
          <Avatar
            user={userMap[userId]}
            size='lg'
            className="outline-gray-700"
            disabled
          />
          <div className={twMerge(
            'flex flex-col'
          )}>
            {userMap[userId].link ? (
              <A
                href={userMap[userId].link}
                className="text-gray-200 font-bold text-2xl py-4 mb-2"
              >
                {userMap[userId].display_name}
              </A>
            )
            : (
              <H1 className="mb-2">
                {userMap[userId].display_name}
              </H1>
            )}
            <div className={twMerge(
              'flex gap-2'
            )}>
              <Small className="text-gray-500">
                no link
              </Small>
              <Small className={twMerge(
                "text-gray-400"
              )}>
                ·
              </Small>
              <Small className="text-gray-500">
                no language
              </Small>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <StarRow
            score={null}
            index={null}
            time={null}
            starNumber={1}
          />
          <StarRow
            score={null}
            index={null}
            time={null}
            starNumber={2}
          />
        </div>

        <div className={twMerge(
          'bg-gray-800 rounded-lg p-4 mb-4',
          'h-16',
          'overflow-y-auto'
        )}>
          <Base className={twMerge(
            "text-gray-500"
          )}>
            {"No note"}
          </Base>
        </div>
      </div>
    </div>
  );
}

function StarRow({
  score,
  index,
  time,
  starNumber
}: {
  score: number | null;
  index: number | null;
  time: number | null;
  starNumber: 1 | 2;
}) {
  return (
    <div className="flex gap-4 items-center mt-2">
      {(score !== null && index !== null && time !== null) ? (
        <>
          <div className={twMerge(
            "flex justify-center items-center",
            "relative"
          )}>
            <div className={twMerge(
              "flex flex-col justify-center items-center"
            )} >
              <Base className="text-gray-300 absolute -top-1/2">
                {score}
              </Base>
              <span className={twMerge(
                "text-4xl filter",
                starNumber === 1
                  ? "hue-rotate-90 brightness-125 grayscale"
                  : "hue-rotate-45 brightness-110"
              )}>
                ⭐
              </span>
            </div>
          </div>

          <div className="flex items-center -ml-2">
            <div className={twMerge(
              "flex items-center justify-center",
              "bg-gray-600 h-9 w-9 rounded-full"
            )}>
              <Base className="text-gray-400">
                {orderNumeral(index! + 1)}
              </Base>
            </div>
          </div>

          <div className="flex items-center">
            <Base className="text-gray-300 text-2xl font-bold">
              {timestamp2Clock(time)}
            </Base>
          </div>
        </>
      ) : (
        <>
          <div className={twMerge(
            "flex justify-center items-center",
            "relative"
          )}>
            <div className={twMerge(
              "flex flex-col justify-center items-center"
            )} >
              <span className={twMerge(
                "text-4xl filter brightness-50 contrast-200 grayscale"
              )}>
                ⭐
              </span>
            </div>
          </div>

          <div className="flex items-center -ml-2">
            <div className={twMerge(
              "flex items-center justify-center",
              "bg-gray-800 h-9 w-9 rounded-full"
            )}>
              <Base className="text-gray-500 font-bold">
                -
              </Base>
            </div>
          </div>

          <div className="flex items-center">
            <Base className="text-gray-600 text-2xl font-bold">
              {'--:--:--'}
            </Base>
          </div>

        </>
      )}
    </div>
  );
}
