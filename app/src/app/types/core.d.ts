type User = {
  id: number;
  display_name: string;
  link: string | null;
  join_time: number;
};

type Leaderboard = {
  id: number,
  name: string,
  note: string | null,
  owner_id: number,
  years: Year[],
  participants: (User & { score: number })[]
};

type Year = {
  year: number,
  leaderboard_id: number,
  days: Day[]
};

type Day = {
  day: number,
  year: number,
  leaderboard_id: number,
  submissions: Record<number, Submission> // user_id -> submission
};

type Submission = {
  user_id: number,
  day: number,
  year: number,
  leaderboard_id: number,
  start_time: number,
  star_1_time: number | null,
  star_2_time: number | null,
  language: string | null,
  link: string | null,
  note: string | null,
  pauses: Pause[]
};

type Pause = {
  id: number,
  start_time: number,
  end_time: number | null
};
