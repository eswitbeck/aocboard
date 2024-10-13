'use client';
import { useState, useEffect } from 'react';

import {
  timestamp2Timestamp,
  timestamp2TimeString,
  generateUTCString
} from '@/shared/utils';

export default function Stars({
  submission,
  updateStar
}: {
  submission: Submission,
  updateStar: (
    time: string,
    star: 'star_1' | 'star_2'
  ) => void
}) {
  const [star1, setStar1] = useState<string>('');
  const [star2, setStar2] = useState<string>('');

  useEffect(() => {
    setStar1(
      timestamp2Timestamp(submission.star_1_end_time) || ''
    );
    setStar2(
      timestamp2Timestamp(submission.star_2_end_time) || ''
    );
  }, [submission]);

  return (
    <div>
      <p>Stars:</p>
      <ul>
        {submission.star_1_end_time &&
          <li>
            <div className="flex gap-2">
              <p>Star 1:</p>
              <input
                type="datetime-local"
                value={star1}
                onChange={(e) => {
                  updateStar(
                    generateUTCString(e.target.value),
                    'star_1'
                  );
                }}
              />
            </div>
          </li>}
        {submission.star_2_end_time &&
          <li>
            <div className="flex gap-2">
              <p>Star 2:</p>
              <input
                type="datetime-local"
                value={star2}
                onChange={(e) => {
                  updateStar(
                    generateUTCString(e.target.value),
                    'star_2'
                  );
                }}
              />
            </div>
          </li>}
      </ul>
    </div>
  );
}
