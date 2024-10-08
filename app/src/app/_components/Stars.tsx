'use client';
import { timestamp2TimeString } from '@/shared/utils';

export default function Stars({
  submission
}: {
  submission: Submission
}) {
  return (
    <div>
      <p>Stars:</p>
      <ul>
        {submission.star_1_end_time &&
          <li>
            <div className="flex gap-2">
              <p>Star 1:</p>
              <p>{timestamp2TimeString(submission.star_1_end_time)}</p>
            </div>
          </li>}
        {submission.star_2_end_time &&
          <li>
            <div className="flex gap-2">
              <p>Star 2:</p>
              <p>{timestamp2TimeString(submission.star_2_end_time)}</p>
            </div>
          </li>}
      </ul>
    </div>
  );
}
