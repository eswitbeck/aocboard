'use server';
import pg from 'pg';
import { headers, cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import bcrypt from 'bcrypt';


import {
  timeString2Timestamp,
  error2String
} from '@/shared/utils';

import {
  getPool,
  getClient,
  withTransaction
} from './db';

import {
  s_Submission2Submission
} from './utils/s2client';

// get dashboard data
//  - get aggregate data
//  - get realtime data
//  - get rankings
//  - get star data

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
  ].map(s => s?.getTime());
  
  for (const p of pauses) {
    if (!p.id) {
      continue;
    }
    const time = p.time.getTime();
    if (!time) {
      continue;
    }
    if (!star1Time  || time <= star1Time) {
      startToStar1.push({
        time: time,
        type: p.type
      });
    } else {
      star1ToStar2.push({
        time: time,
        type: p.type
      });
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

    if (start.type !== 'resume' ||
      (end && end.type !== 'pause')) {
      throw new Error('getTotalTime -- invalid pause/resume sequence');
    }

    if (end) {
      totalTime += end.time! - start.time!;
    } else {
      return {
        totalTime,
        lastTimestamp: new Date(start.time!).toISOString()
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
    const  { rows: [participant] } = await getPool().query(
      `SELECT
        lu.user_id
       FROM UserLeaderBoard lu
       WHERE lu.user_id = $1
         AND lu.leaderboard_id = $2;`,
      [userId, leaderboardId]
    );

    if (!participant) {
      return { status: 403 };
    }

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
        AND s.leaderboard_id = $4
       ORDER BY sp.time, sp.type ASC;`,
      [userId, day, year, leaderboardId]
    );

    const s_Submission = rows[0];

    if (!s_Submission) {
      return { status: 404, error: 'no submission' };
    }

    if (userId !== s_Submission.user_id) {
      return { status: 403 };
    }

    const s_Pauses = rows
      .filter(row => row.sp_id)
      .map((row: {
        day: number,
        year: number,
        leaderboard_id: number,
        user_id: number,
        sp_id: number,
        sp_submission_id: number,
        sp_parent_id: number | null,
        sp_type: 'pause' | 'resume',
        sp_time: Date
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


    const clientSubmission = s_Submission2Submission(s_Submission, s_Pauses);

    return {
      status: 200,
      body: {
        total_time: getTotalTime(s_Submission, s_Pauses),
        data: clientSubmission
      }
    };
  } catch (error) {
    // @ts-ignore
    return { status: 500, error: error2String(error) };
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
    .toISOString();

  if (!userId) {
    return { status: 401 };
  }

  const fn = async (client: pg.PoolClient) => {
    const { rows: [participant] } = await client.query(
      `SELECT
        lu.user_id
       FROM UserLeaderBoard lu
       WHERE lu.user_id = $1
         AND lu.leaderboard_id = $2;`,
      [userId, leaderboardId]
    );

    if (!participant) {
      return { status: 403 };
    }

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
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

export const pauseSubmission = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number
): Promise<HTTPLike<{ time: number }>> => {
  const time = new Date()
    .toISOString();

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
       ORDER BY time DESC, type ASC
       LIMIT 1;`,
      [userId, day, year, leaderboardId]
    );

    if (last_s_Pause && last_s_Pause.type === 'pause') {
      return { status: 400, error: 'already paused' };
    }

    // check permissions
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
    return { status: 500, error: error2String(error) };
  }
}

export const resumeSubmission = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number
): Promise<HTTPLike<{ time: number }>> => {
  const time = new Date()
    .toISOString();

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
       ORDER BY time DESC, type ASC
       LIMIT 1;`,
      [userId, day, year, leaderboardId]
    );

    if (!last_s_Pause || last_s_Pause.type === 'resume') {
      return { status: 400, error: 'already resumed' };
    }

    // check permissions
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
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

export const completeSubmission = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number
): Promise<HTTPLike<Submission>> => {
  if (!userId) {
    return { status: 401 };
  }

  const time = new Date()
    .toISOString();

  const fn = async (client: pg.PoolClient) => {
    const { rows: [stageResult] } = await client.query(
      `SELECT
       CASE
         WHEN s.star_1_end_time IS NULL THEN 'star_1'
         ELSE 'star_2'
       END AS stage
       FROM Submission s
       WHERE user_id = $1
        AND day = $2
        AND year = $3
        AND leaderboard_id = $4;`,
      [userId, day, year, leaderboardId]
    );

    if (!stageResult) {
      return { status: 404, error: 'no submission' };
    }

    const { stage } = stageResult;

    // check permissions
    const { rows: [s_Submission] } = await client.query(
      `UPDATE Submission
       SET ${stage}_end_time = $1
       WHERE user_id = $2
        AND day = $3
        AND year = $4
        AND leaderboard_id = $5
       RETURNING *;`,
      [time, userId, day, year, leaderboardId]
    );

    return {
      status: 200,
      body: {
        data: s_Submission
      }
    };
  }

  try {
    return await withTransaction(fn);
  } catch (error) {
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

export const restartSubmission = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number
): Promise<HTTPLike<Submission>> => {
  if (!userId) {
    return { status: 401 };
  }

  try {
    const pool = getPool();
    // check permissions
    const { rows: [s_Submission] } = await pool.query(
      `DELETE FROM Submission
       WHERE user_id = $1
        AND day = $2
        AND year = $3
        AND leaderboard_id = $4
       RETURNING *;`,
      [userId, day, year, leaderboardId]
    );

    if (!s_Submission) {
      return { status: 404, error: 'no submission' };
    }

    return {
      status: 204,
    };
  } catch (error) {
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

// edit submission

export const updatePause = async (
  userId: number | null,
  pauseId: number,
  time: string
): Promise<HTTPLike<{ time: number }>> => {
  if (!userId) {
    return { status: 401 };
  }

 const client = await getClient();

 const fn = async (client: pg.PoolClient) => {
   const { rows: [existing] } = await client.query(
     `SELECT
       s.start_time,
       s.star_1_end_time,
       s.star_2_end_time,
       sp.user_id,
       parent.time as parent_time,
       sp.time as time
      FROM
        Submission s
      RIGHT JOIN
      SubmissionPause sp
        USING(user_id, day, year, leaderboard_id)
      LEFT JOIN
        SubmissionPause parent
          ON sp.parent_id = parent.id
      WHERE sp.id = $1;`,
     [pauseId]
   );

   if (existing?.user_id !== userId) {
     return { status: 403 };
   }

   const { rows: allPauses } = await client.query(
      `SELECT
        p.id, p.type, p.time
      FROM SubmissionPause orig_pause
      JOIN Submission s
        ON orig_pause.user_id = s.user_id
        AND orig_pause.day = s.day
        AND orig_pause.year = s.year
        AND orig_pause.leaderboard_id = s.leaderboard_id
      LEFT JOIN SubmissionPause p
        ON p.user_id = s.user_id
        AND p.day = s.day
        AND p.year = s.year
        AND p.leaderboard_id = s.leaderboard_id
      WHERE orig_pause.id = $1
        AND (p.id IS NULL OR p.id <> $1)
        AND (orig_pause.parent_id IS NULL OR p.id <> orig_pause.parent_id)
      ORDER BY p.time ASC;`,
     [pauseId]
   );

   const updatingDate = new Date(time);

   // resume can't be before a parent pause
   if (existing.parent_time && updatingDate.getTime() < existing.parent_time) {
     return { status: 400, error: 'invalid time' };
   }

   // TODO simplify to that sorted business below
   const times = allPauses.map(p => p.time.getTime());
   times.unshift(existing.start_time.getTime());

   const [firstTime, secondTime] = [existing.star_1_end_time, existing.star_2_end_time]
     .map(t => t?.getTime());

   let insertedFirst = firstTime === null;
   let insertedSecond = secondTime === null;
   for (let i = 0; i < times.length - 1; i++) {
     const prevTime = times[i];
     const nextTime = times[i + 1];
     if (!insertedFirst &&
       prevTime < firstTime &&
       (!nextTime || nextTime > firstTime)
     ) {
       times.splice(i + 1, 0, firstTime);
     }
     if (!insertedSecond &&
       prevTime < secondTime &&
       (!nextTime || nextTime > secondTime)
     ) {
       times.splice(i + 1, 0, secondTime);
     }
   }

   const bounds = {
     lower: null,
     upper: null
   };

   for (let i = 0; i < times.length; i++) {
     const prevTime = times[i];
     const nextTime = times?.[i + 1] ?? null;

     // time can't be before start time
     if (prevTime > existing.time.getTime()) {
       return { status: 400, error: 'invalid time' };
     }

     if (!nextTime || nextTime > existing.time.getTime()) {
       bounds.lower = prevTime;
       bounds.upper = nextTime;
       break;
     }
   }

   if (updatingDate.getTime() < bounds.lower! ||
       (bounds.upper && updatingDate.getTime() > bounds.upper)
   ) {
     // time can't move outside of bounding pauses/starts/stars
     return { status: 400, error: 'invalid time' };
   }

   // time can't be in the future
   if (updatingDate.getTime() > new Date().getTime()) {
     return { status: 400, error: 'invalid time' };
   }

   const { rows: [s_Pause] } = await client.query(
     `UPDATE SubmissionPause
      SET time = $1
      WHERE id = $2
      RETURNING time;`,
     [time, pauseId]
   );

   return {
     status: 200,
     body: {
       data: s_Pause
     }
   };
  }

  try {
    return await withTransaction(fn);
  } catch (error) {
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

export const updateStartTime = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number,
  time: string
): Promise<HTTPLike<{ time: string }>> => {
  if (!userId) {
    return { status: 401 };
  }

  const updatingDate = new Date(time);

  const fn = async (client: pg.PoolClient) => {
    const { rows: [existing] } = await client.query(
      `SELECT
        s.start_time,
        s.star_1_end_time,
        s.user_id,
        sp.time as pause_time
       FROM
         Submission s
       LEFT JOIN
         SubmissionPause sp
           ON sp.user_id = s.user_id
           AND sp.day = s.day
           AND sp.year = s.year
           AND sp.leaderboard_id = s.leaderboard_id
       WHERE s.user_id = $1
         AND s.day = $2
         AND s.year = $3
         AND s.leaderboard_id = $4
      ORDER BY sp.time ASC, sp.type ASC;`,
      [userId, day, year, leaderboardId]
    );

    if (!existing) {
      return { status: 404, error: 'no submission' };
    }

    if (existing.user_id !== userId) {
      return { status: 403 };
    }

    // time can't be after first pause
    if (existing.pause_time && updatingDate.getTime() > existing.pause_time.getTime()) {
      return { status: 400, error: 'invalid time' };
    }

    // time can't be in the future
    if (updatingDate.getTime() > new Date().getTime()) {
      return { status: 400, error: 'invalid time' };
    }

    // time can't be after star 1
    if (existing.star_1_end_time &&
        updatingDate.getTime() > existing.star_1_end_time.getTime()
    ) {
      return { status: 400, error: 'invalid time' };
    }

    const { rows: [s_Submission] } = await client.query(
      `UPDATE Submission
       SET start_time = $1
       WHERE user_id = $2
         AND day = $3
         AND year = $4
         AND leaderboard_id = $5
       RETURNING start_time;`,
      [time, userId, day, year, leaderboardId]
    );

    return {
      status: 200,
      body: {
        data: { time: new Date(s_Submission.start_time).toISOString() }
      }
    };
  }

  try {
    return await withTransaction(fn);
  } catch (error) {
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

export const updateStarTime = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number,
  time: string,
  star: 'star_1' | 'star_2'
): Promise<HTTPLike<{ time: string }>> => {
  if (!userId) {
    return { status: 401 };
  }

  const updatingDate = new Date(time);

  const fn = async (client: pg.PoolClient) => {
    const { rows: existing } = await client.query(
      `SELECT
        s.start_time,
        s.star_1_end_time,
        s.star_2_end_time,
        s.user_id,
        sp.time as pause_time
       FROM
         Submission s
       LEFT JOIN
         SubmissionPause sp
           ON sp.user_id = s.user_id
           AND sp.day = s.day
           AND sp.year = s.year
           AND sp.leaderboard_id = s.leaderboard_id
       WHERE s.user_id = $1
         AND s.day = $2
         AND s.year = $3
         AND s.leaderboard_id = $4
      ORDER BY sp.time ASC, sp.type ASC;`,
      [userId, day, year, leaderboardId]
    );

    const submission = existing[0];

    if (!submission) {
      return { status: 404, error: 'no submission' };
    }

    if (submission.user_id !== userId) {
      return { status: 403 };
    }

    // time can't be before start time
    if (updatingDate.getTime() < submission.start_time.getTime()) {
      return { status: 400, error: 'invalid time' };
    }

    const pauses = existing
      .filter(row => row.pause_time)
      .map(row => row.pause_time);

    const times = [
      submission.start_time,
      ...(star === 'star_1' ? [submission.star_2_end_time] : []),
      ...(star === 'star_2' ? [submission.star_1_end_time] : []),
      ...pauses
    ]
    .map(t => t?.getTime())
     .filter(t => t)
     .sort((a, b) => a - b);


    let bounds = {
      lower: null,
      upper: null
    };

    for (let i = 0; i < times.length; i++) {
      const prevTime = times[i];
      const nextTime = times?.[i + 1] ?? null;

      if (nextTime > (star === 'star_1'
                        ? submission.star_1_end_time.getTime()
                        : submission.star_2_end_time.getTime())
      ) {
        bounds.lower = prevTime;
        bounds.upper = nextTime;
        break;
      }
    }
    switch (star) {
      case 'star_1':
        if (!submission.star_1_end_time) {
          return { status: 400, error: 'star 1 not completed' };
        }
        if (updatingDate.getTime() < bounds.lower! ||
            (bounds.upper && updatingDate.getTime() > bounds.upper)
        ) {
          return { status: 400, error: 'invalid time' };
        }

        const { rows: [s_Submission] } = await client.query(
          `UPDATE Submission
           SET star_1_end_time = $1
           WHERE user_id = $2
             AND day = $3
             AND year = $4
             AND leaderboard_id = $5
           RETURNING star_1_end_time;`,
          [time, userId, day, year, leaderboardId]
        );

        return {
          status: 200,
          body: {
            data: { time: new Date(s_Submission.star_1_end_time).toISOString() }
          }
        };

      case 'star_2':
        if (!submission.star_1_end_time || !submission.star_2_end_time) {
          return { status: 400, error: 'star 2 not completed' };
        }

        if (updatingDate.getTime() < bounds.lower! ||
            (bounds.upper && updatingDate.getTime() > bounds.upper)
        ) {
          return { status: 400, error: 'invalid time' };
        }

        const { rows: [s_Submission2] } = await client.query(
          `UPDATE Submission
           SET star_2_end_time = $1
           WHERE user_id = $2
             AND day = $3
             AND year = $4
             AND leaderboard_id = $5
           RETURNING star_2_end_time;`,
          [time, userId, day, year, leaderboardId]
        );

        return {
          status: 200,
          body: {
            data: { time: new Date(s_Submission2.star_2_end_time).toISOString() }
          }
        };
    }
  }

  try {
    return await withTransaction(fn);
  } catch (error) {
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

export const getLanguages = async (): Promise<HTTPLike<{ name: string, id: number }[]>> => {
  try {
    const { rows } = await getPool().query(
      `SELECT name, id
       FROM Language;`
    );

    return {
      status: 200,
      body: { data: rows }
    };
  } catch (error) {
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

export const updateLanguage = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number,
  languageId: number
): Promise<HTTPLike<{ id: number }>> => {

  if (!userId) {
    return { status: 401 };
  }

  const fn = async (client: pg.PoolClient) => {
    const { rows: [s_Submission] } = await client.query(
      `SELECT
        s.user_id
       FROM Submission s
       WHERE s.user_id = $1
         AND s.day = $2
         AND s.year = $3
         AND s.leaderboard_id = $4;`,
      [userId, day, year, leaderboardId]
    );

    if (!s_Submission) {
      return { status: 404, error: 'no submission' };
    }

    if (s_Submission.user_id !== userId) {
      return { status: 403 };
    }

    const { rows: [language] } = await client.query(
      `UPDATE Submission
       SET language_id = $1
       WHERE user_id = $2
         AND day = $3
         AND year = $4
         AND leaderboard_id = $5
       RETURNING language_id;`,
      [
        languageId === 0 ? null : languageId,
        userId,
        day,
        year,
        leaderboardId
      ]
    );

    return {
      status: 200,
      body: {
        data: { id: language.language_id }
      }
    };
  }

  try {
    return await withTransaction(fn);
  } catch (error) {
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

export const updateSubmission = async (
  userId: number | null,
  day: number,
  year: number,
  leaderboardId: number,
  field: 'link' | 'note',
  value: string
): Promise<HTTPLike<{ value: string }>> => {
  if (!userId) {
    return { status: 401 };
  }

  const fn = async (client: pg.PoolClient) => {
    const { rows: [s_Submission] } = await client.query(
      `SELECT
        s.user_id
       FROM Submission s
       WHERE s.user_id = $1
         AND s.day = $2
         AND s.year = $3
         AND s.leaderboard_id = $4;`,
      [userId, day, year, leaderboardId]
    );

    if (!s_Submission) {
      return { status: 404, error: 'no submission' };
    }

    if (s_Submission.user_id !== userId) {
      return { status: 403 };
    }

    const { rows: [submission] } = await client.query(
      `UPDATE Submission
       SET ${field} = $1
       WHERE user_id = $2
         AND day = $3
         AND year = $4
         AND leaderboard_id = $5
       RETURNING ${field};`,
      [value, userId, day, year, leaderboardId]
    );

    return {
      status: 200,
      body: {
        data: { value: submission[field] }
      }
    };
  }

  try {
    return await withTransaction(fn);
  } catch (error) {
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

export const getUsersByLeaderboard = async (
  userId: number | null,
  leaderboardId: number
): Promise<HTTPLike<LeaderboardUserMap>> => {
  if (!userId) {
    return { status: 401 };
  }

  try {
    const pool = getPool();
    const { rows: users } = await pool.query(
      `SELECT
        u.id,
        u.display_name,
        u.link
        -- TODO aggregate score from years/days
       FROM AppUser u
       JOIN UserLeaderBoard lu
         ON lu.user_id = u.id
       WHERE lu.leaderboard_id = $1;`,
      [leaderboardId]
    );

    const leaderboardUserMap: LeaderboardUserMap = {};
    for (const user of users) {
      leaderboardUserMap[user.id] = {
        display_name: user.display_name,
        score: 0,
        link: user.link
      };
    }

    if (!Object.keys(leaderboardUserMap).includes(userId.toString())) {
      return { status: 403 };
    }

    return {
      status: 200,
      body: {
        data: leaderboardUserMap
      }
    };
  } catch (error) {
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

export const getLeaderboardInfo = async (
  userId: number | null,
  leaderboardId: number
): Promise<HTTPLike<LeaderboardInfo>> => {
  if (!userId) {
    return { status: 401 };
  }

  try {
    const pool = getPool();
    const { rows: submissions } = await pool.query(
      `SELECT
        s.*,
        l.name language,
        sp.id as sp_id,
        sp.parent_id as sp_parent_id,
        sp.type as sp_type,
        sp.time as sp_time
       FROM Submission s
       LEFT JOIN SubmissionPause sp
         USING(user_id, day, year, leaderboard_id)
       LEFT JOIN Language l
         ON s.language_id = l.id
       WHERE s.leaderboard_id = $1
       ORDER BY s.year ASC, s.day ASC, s.user_id ASC, sp.time ASC, sp.type ASC;`,
      [leaderboardId]
    );

    const processedSubmissions = {} as {
      [key: string]: {
        submission: s_Submission,
        pauses: s_Pause[]
      }
    };

    for (const submission of submissions) {
      const { user_id, day, year } = submission;
      const key = `${user_id}-${day}-${year}`;
      if (!processedSubmissions[key]) {
        processedSubmissions[key] = {
          submission,
          pauses: []
        };
      }
      if (submission.sp_id) {
        processedSubmissions[key].pauses.push({
          id: submission.sp_id,
          day: submission.day,
          year: submission.year,
          leaderboard_id: submission.leaderboard_id,
          user_id: submission.user_id,
          parent_id: submission.sp_parent_id,
          type: submission.sp_type,
          time: submission.sp_time
        });
      }
    }


    const leaderboardInfo: LeaderboardInfo = {};
    for (const key in processedSubmissions) {
      const { submission, pauses } = processedSubmissions[key];
      const { user_id, day, year } = submission;
      if (!leaderboardInfo[year]) {
        leaderboardInfo[year] = {};
      }
      if (!leaderboardInfo[year][day]) {
        leaderboardInfo[year][day] = [];
      }
      leaderboardInfo[year][day][user_id] = {
        start_time: submission.start_time.toISOString(),
        star_1_end_time: submission.star_1_end_time?.toISOString() ?? null,
        star_2_end_time: submission.star_2_end_time?.toISOString() ?? null,
        total_time: getTotalTime(submission, pauses),
        link: submission.link,
        note: submission.note,
        language: submission.language
      };
    }

    return {
      status: 200,
      body: {
        data: leaderboardInfo
      }
    };
  } catch (error) {
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

// refresh token
export async function refreshAccessToken() {
  const time = new Date();
  const refreshToken = cookies().get('aocboardAuthorization');
  if (!refreshToken) {
    return { status: 401 };
  }

  const pool = getPool();
  const { rows: [row] } = await pool.query(
    `SELECT
      user_id,
      expire_time
     FROM AuthToken
     WHERE token = $1;`,
    [refreshToken.value]
  );

  if (!row) {
    return { status: 401 };
  }

  const { user_id, expire_time } = row;
  if (time.getTime() > expire_time.getTime()) {
    return { status: 401 };
  }

  const newAccessToken = generateAccessToken(user_id);
  cookies().set('aocboardAccessToken', newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: time.getTime() + 1000 * 60 * 15
  });

  return { status: 200 };
}

async function generateRefreshToken(userid: number): Promise<string> {
  const time = new Date();
  // Valid for 7 days
  const expiration = new Date(time.getTime() + 1000 * 60 * 60 * 24 * 7);
  const pool = getPool();
  const token = uuidv4();
  const { rows: [row] } = await pool.query(
    `INSERT INTO AuthToken
     (user_id, token, expire_time)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id)
     DO UPDATE SET token = $2, expire_time = $3
     RETURNING token;`,
    [userid, token, expiration]
  );

  return row.token;
}

function generateAccessToken(userid: number): string {
  const time = new Date();
  const expiration = new Date(time.getTime() + 1000 * 60 * 15);
  const object = {
    userid,
    expiration
  };

  const json = JSON.stringify(object);
  const encryptedString = encrypt(json, process.env.ACCESS_TOKEN_SECRET!);
  const base64String = btoa(encryptedString);
  return base64String;
}

// should be on cookie, not token
export async function getUserIdFromAccessToken(
): Promise<number | null> {
  const accessToken = cookies().get('aocboardAccessToken');
  if (!accessToken) {
    return null;
  }
  const decodedString = atob(accessToken.value);
  const decryptedString = decrypt(
    decodedString,
    process.env.ACCESS_TOKEN_SECRET!
  );
  const object = JSON.parse(decryptedString);
  if (!Object.hasOwn(object, 'userid') || !Object.hasOwn(object, 'expiration')) {
    return null;
  }
  const expiration = new Date(object.expiration);
  const time = new Date();
  if (time.getTime() > expiration.getTime()) {
    return null;
  }

  return object.userid;
}


// ---------
// -- gloria ad ChatGPT
function encrypt(text: string, secretKey: string) {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey, 'hex'),
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string, secretKey: string) {
  const algorithm = 'aes-256-cbc';
  const [ivHex, encrypted] = encryptedText.split(':');
  if (!ivHex || !encrypted) {
    return '{}';
  }

  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, 'hex'),
    iv
  );

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
// -- gloria ad ChatGPT
// ---------

export async function login(username: string, password: string) {
  const time = new Date();
  const pool = getPool();
  const { rows: [row] } = await pool.query(
    `SELECT
      id,
      encrypted_password
     FROM AppUser
     WHERE username = $1;`,
    [username]
  );

  if (!row) {
    return { status: 401 };
  }

  const { id, encrypted_password: hashedPassword } = row;

  if (!bcrypt.compareSync(password, hashedPassword)) {
    return { status: 401 };
  }

  const refreshToken = await generateRefreshToken(id);
  const accessToken = generateAccessToken(id);

  cookies().set('aocboardAuthorization', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: time.getTime() + 1000 * 60 * 60 * 24 * 7
  });
  cookies().set('aocboardAccessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: time.getTime() + 1000 * 60 * 15
  });
}

export async function logout() {
  const time = new Date();
  cookies().set('aocboardAuthorization', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: time.getTime()
  });
  cookies().set('aocboardAccessToken', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: time.getTime()
  });
}

export async function registerUser(
  username: string,
  password: string
) {
  try {
    const pool = getPool();
    const hashedPassword = bcrypt.hashSync(password, 10);
    await pool.query(
      `INSERT INTO AppUser
       (username, encrypted_password, display_name)
       VALUES ($1, $2, $1);`,
      [username, hashedPassword]
    );

    await login(username, password);

    return { status: 201 };
  } catch (error) {
    // @ts-ignore
    return { status: 500, error: error2String(error) };
  }
}

// add language to list

// update account (link, password??, display name)
// get account data
