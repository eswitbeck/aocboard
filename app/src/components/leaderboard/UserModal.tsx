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
  getSubmission,
  setSubmissionFetcher,
  userMap
}: {
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
  
  const submission = submissionResp.body!.data;
  const totalTime = submissionResp.body!.total_time;

  if (!submission || !totalTime) {
    return null;
  }

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
