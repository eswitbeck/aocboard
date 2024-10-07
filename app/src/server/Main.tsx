'use server';

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

const timeString2Timestamp = (time: string | null): number | null => {
  if (!time) {
    return null;
  }
  return new Date(time).getTime();
}

type TotalTime = {
  totalTime: number,
  lastTimestamp?: number
}

const getTotalTime = (
  submission: s_Submission,
  pauses: s_Pause[]
): TotalTime => {
  const startToStar1 = [];
  const star1ToStar2 = [];

  const [start, star1Time, star2Time] = [
    submission.start_time,
    submission.star_1_end_time,
    submission.star_2_end_time
  ].map(timeString2Timestamp);

  for (const p of pauses) {
    if (!star1Time  || p.time <= star1Time) {
      startToStar1.push(p);
    } else {
      star1ToStar2.push(p);
    }
  }

  const times = [
    {
      time: start,
      type: 'resume'
    },
    ...startToStar1,
    ...(star1Time 
      ? [{
        time: star1Time,
        type: 'pause'
      }, {
        time: star1Time,
        type: 'resume'
      }]
      : []),
    ...star1ToStar2,
    ...(star2Time
      ? [{
        time: star2Time,
        type: 'pause'
      }]
      : [])
  ];

  let totalTime = 0;
  for (let i = 0; i < times.length; i += 2) {
    const start = times[i];
    const end = times?.[i + 1];

    if (end) {
      totalTime += end.time! - start.time!;
    } else {
      return {
        totalTime,
        lastTimestamp: start.time!
      };
    }
  }

  return {
    totalTime
  };
}

export const getSubmission = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number
): Promise<HTTPLike<Submission | null> & { body?: { total_time: TotalTime; }}> => {
  if (!userId) {
    return { status: 401 };
  }
  try {
    const { rows } = await getPool().query(
      `SELECT 
        s.user_id, s.day, s.year, s.leaderboard_id, s.start_time,
        s.star_1_end_time, s.star_2_end_time, l.name language, s.link, s.note,
        sp.id as sp_id,
        sp.parent_id as sp_parent_id,
        sp.type as sp_type,
        sp.time as sp_time
      FROM Submission s
       LEFT JOIN Language l ON s.language_id = l.id
       LEFT JOIN SubmissionPause sp ON
        sp.user_id = s.user_id
        AND sp.day = s.day
        AND sp.year = s.year
        AND sp.leaderboard_id = s.leaderboard_id
       WHERE s.user_id = $1
        AND s.day = $2
        AND s.year = $3
        AND s.leaderboard_id = $4;`,
      [userId, day, year, leaderboardId]
    );

    const s_Submission = rows[0];
    const s_Pauses = rows.map((row: {
      day: number,
      year: number,
      leaderboard_id: number,
      user_id: number,
      sp_id: number,
      sp_submission_id: number,
      sp_parent_id: number | null,
      sp_type: 'pause' | 'resume',
      sp_time: number
    }) => ({
      id: row.sp_id,
      day: row.day,
      year: row.year,
      leaderboard_id: row.leaderboard_id,
      user_id: row.user_id,
      parent_id: row.sp_parent_id,
      type: row.sp_type,
      time: row.sp_time
    }));

    if (!s_Submission) {
      return { status: 404, error: 'no submission' };
    }

    const clientSubmission = s_Submission2Submission(s_Submission, s_Pauses);

    return {
      status: 200,
      body: {
        total_time: getTotalTime(s_Submission, s_Pauses),
        data: clientSubmission
      }
    };
  } catch (error) {
    return { status: 500, error };
  }
}

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
         DO UPDATE SET day = Submission.day -- noop to allow returning
         RETURNING *
        )
      SELECT
        s.user_id, s.day, s.year, s.leaderboard_id, s.start_time,
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

export const pauseSubmission = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number
): Promise<HTTPLike<{ time: number }>> => {
  const time = new Date()
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  if (!userId) {
    return { status: 401 };
  }

  const fn = async (client: pg.PoolClient) => {
    const { rows: [last_s_Pause] } = await client.query(
      `SELECT type
       FROM SubmissionPause
       WHERE user_id = $1
        AND day = $2
        AND year = $3
        AND leaderboard_id = $4
       ORDER BY time DESC
       LIMIT 1;`,
      [userId, day, year, leaderboardId]
    );

    if (last_s_Pause && last_s_Pause.type === 'pause') {
      return { status: 400, error: 'already paused' };
    }

    const { rows: [s_Pause] } = await client.query(
      `INSERT INTO SubmissionPause
       (user_id, day, year, leaderboard_id, type, time)
       VALUES ($1, $2, $3, $4, 'pause', $5)
       RETURNING time;`,
      [userId, day, year, leaderboardId, time]
    );

    return {
      status: 201,
      body: {
        data: s_Pause
      }
    };
  }

  try {
    return await withTransaction(fn);
  } catch (error: any) {
    return { status: 500, error: error.message };
  }
}

export const resumeSubmission = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number
): Promise<HTTPLike<{ time: number }>> => {
  const time = new Date()
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  if (!userId) {
    return { status: 401 };
  }

  const fn = async (client: pg.PoolClient) => {
    const { rows: [last_s_Pause] } = await client.query(
      `SELECT id, type
       FROM SubmissionPause
       WHERE user_id = $1
        AND day = $2
        AND year = $3
        AND leaderboard_id = $4
       ORDER BY time DESC
       LIMIT 1;`,
      [userId, day, year, leaderboardId]
    );

    if (!last_s_Pause || last_s_Pause.type === 'resume') {
      return { status: 400, error: 'already resumed' };
    }

    const { rows: [s_Pause] } = await client.query(
      `INSERT INTO SubmissionPause
       (user_id, day, year, leaderboard_id, type, time, parent_id)
       VALUES ($1, $2, $3, $4, 'resume', $5, $6)
       RETURNING time;`,
      [userId, day, year, leaderboardId, time, last_s_Pause.id]
    );

    return {
      status: 201,
      body: {
        data: s_Pause
      }
    };
  }

  try {
    return await withTransaction(fn);
  } catch (error) {
    return { status: 500, error };
  }
}

// complete submission
//  - add star 1 to submission
//  - add star 2 to submission (finish)
// delete submission (restart)
// edit submission
// add language to list
//
// update account (link, password??, display name)
// get account data
//
// auth user (login) (send token)
// auth middleware (check token)
