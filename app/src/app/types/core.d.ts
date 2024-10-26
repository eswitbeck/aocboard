type User = {
  id: number;
  display_name: string;
  link: string | null;
  join_time: number;
  avatar_color: AvatarColor;
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
  start_time: string,
  star_1_end_time: string | null,
  star_2_end_time: string | null,
  language: string | null,
  link: string | null,
  note: string | null,
  score: number,
  pauses: Pause[]
};

type Pause = {
  start_id: number,
  end_id: number | null,
  start_time: string,
  end_time: string | null
};
