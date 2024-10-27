'use client';
import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge'
import {
  Base,
	Small,
	H1,
	H3,
	A
} from '@/components/core/text';

import Avatar from '@/components/leaderboard/Avatar';

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

  console.log(submission);

  return (
    <div
      className={twMerge(
        'absolute inset-0 bg-gray-900 bg-opacity-50',
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
                className="text-gray-200 font-bold text-2xl py-4"
              >
                {userMap[submission.user_id].display_name}
              </A>
            )
            : (
              <H1>
                {userMap[submission.user_id].display_name}
              </H1>
            )}
            <div className={twMerge(
              'flex gap-2'
            )}>
              {submission.link && (
                <A href={submission.link} className="text-sm text-gray-400">
                   code
                </A>
              )}
              {submission.link && submission.language &&
                <Small className="text-gray-400">
                  ·
                </Small>
              }
              {submission.language && (
                <Small className="text-gray-400">
                  {submission.language}
                </Small>
              )}
            </div>
          </div>
        </div>

        {submission.note && (
          <div className={twMerge(
            'bg-gray-800 rounded-lg p-4 mb-4'
          )}>
            <Base className="text-gray-400">
              {submission.note}
            </Base>
          </div>
        )}
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
        'absolute inset-0 bg-gray-900 bg-opacity-50',
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
            disabled={true}
          />
          <div className={twMerge(
            'flex flex-col'
          )}>
            {userMap[userId].link ? (
              <A
                href={userMap[userId].link}
                className="text-gray-200 font-bold text-2xl py-4"
              >
                {userMap[userId].display_name}
              </A>
            )
            : (
              <H1>
                {userMap[userId].display_name}
              </H1>
            )}
            <div className={twMerge(
              'flex gap-2'
            )}>
              {/* TODO: include disabled link/lang state? */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
