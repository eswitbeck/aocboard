type HTTPLike<T> = {
  status: number;
  body?: { data: T };
  error?: any;
};

type s_User = {
  id: number;
  username: string;
  encrypted_password: string;
  salt: string;
  display_name: string;
  link: string | null;
  join_time: number;
  last_login: number;
};

type s_Leaderboard = {
  id: number;
  name: string;
  note: string | null;
  owner_id: number;
};

type s_Year = {
  year: number;
  leaderboard_id: number;
};

type s_Day = {
  day: number;
  year: number;
  leaderboard_id: number;
};

type s_Submission = {
  user_id: number;
  day: number;
  year: number;
  leaderboard_id: number;
  start_time: string;
  star_1_end_time: string | null;
  star_2_end_time: string | null;
  score: number;
  language: string | null;
  link: string | null;
  note: string | null;
};

type s_Pause = {
  id: number;
  day: number;
  year: number;
  leaderboard_id: number;
  user_id: number;
  parent_id: number | null;
  type: 'pause' | 'resume';
  time: number;
};
