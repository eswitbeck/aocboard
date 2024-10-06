import {
  getPool,
  getClient,
  withTransaction
} from './db';

import pg from 'pg';

import {
  s_Submission2Submission
} from './utils/s2client';

// get auth status

// get main layout data

// get dashboard data
//  - get aggregate data
//  - get realtime data
//  - get rankings
//  - get star data

// get submission data
export const getSubmission = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number
): Promise<HTTPLike<Submission>> => {
  if (!userId) {
    return { status: 401 };
  }
  try {
    const { rows } = await getPool().query(
      `SELECT 
        s.id, s.user_id, s.day, s.year, s.leaderboard_id, s.start_time,
        s.star_1_time, s.star_2_time, s.language, s.link, s.note,
        sp.id as sp_id,
        sp.submission_id as sp_submission_id,
        sp.parent_id as sp_parent_id,
        sp.type as sp_type,
        sp.time as sp_time
      FROM Submission s
       LEFT JOIN SubmissionPause sp ON s.id = sp.submission_id
       WHERE s.user_id = $1
         AND s.day = $2
         AND s.year = $3
         AND s.leaderboard_id = $4;`,
      [userId, day, year, leaderboardId]
    );

    const s_Submission = rows[0];
    const s_Pauses = rows.map((row: {
      sp_id: number,
      sp_submission_id: number,
      sp_parent_id: number | null,
      sp_type: 'pause' | 'resume',
      sp_time: number
    }) => ({
      id: row.sp_id,
      submission_id: row.sp_submission_id,
      parent_id: row.sp_parent_id,
      type: row.sp_type,
      time: row.sp_time
    }));

    const clientSubmission = s_Submission2Submission(s_Submission, s_Pauses);

    return {
      status: 200,
      body: {
        data: clientSubmission
      }
    };
  } catch (error) {
    return { status: 500, error };
  }
}

// start submission
export const startSubmission = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number
): Promise<HTTPLike<Submission>> => {
  'use server';
  const time = new Date()
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  if (!userId) {
    return { status: 401 };
  }

  const fn = async (client: pg.PoolClient) => {
    await client.query(
      `INSERT INTO LeaderboardYear (leaderboard_id, year)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING;`,
      [leaderboardId, year]
    );
    await client.query(
       `INSERT INTO LeaderboardDay (leaderboard_id, year, day)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING;`,
      [leaderboardId, year, day]
    );
    const { rows: [s_Submission] } = await client.query(
      `WITH inserted_submission AS (
         INSERT INTO Submission
         (user_id, leaderboard_id, year, day, start_time)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, leaderboard_id, year, day)
         DO UPDATE SET id = Submission.id -- noop to allow returning
         RETURNING *
        )
      SELECT
        s.id, s.user_id, s.day, s.year, s.leaderboard_id, s.start_time,
        s.star_1_end_time, s.star_2_end_time, s.language_id, s.link, s.note,
        l.name AS language
       FROM inserted_submission s
       LEFT JOIN Language l ON s.language_id = l.id;`,
      [userId, leaderboardId, year, day, time]
    );
    const clientSubmission = s_Submission2Submission(s_Submission, []);
    return {
      // NB maybe better to just check first, 303 if existing, 201 if new
      status: 201,
      body: {
        data: clientSubmission
      }
    };
  }

  try {
    return await withTransaction(fn);
  } catch (error) {
    return { status: 500, error };
  }
}


// pause submission
// resume submission
// add star 1 to submission
// add star 2 to submission (finish)
// delete submission (restart)
// edit submission
// add language to list
//
// update account (link, password??, display name)
// get account data
//
// auth user (login) (send token)
// auth middleware (check token)
