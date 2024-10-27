type HTTPLike<T> = {
  status: number;
  body?: { data: T };
  error?: any;
};

type AvatarColor = 
  'red' |
  'amber' |
  'green' |
  'orange' |
  'yellow' |
  'emerald' |
  'lime' |
  'teal' |
  'cyan' |
  'blue' |
  'indigo' |
  'purple' |
  'fuchsia' |
  'pink' |
  'slate';

type s_User = {
  id: number;
  username: string;
  encrypted_password: string;
  salt: string;
  display_name: string;
  link: string | null;
  join_time: number;
  last_login: number;
  avatar_color: AvatarColor;
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
  start_time: Date;
  star_1_end_time: Date | null;
  star_2_end_time: Date | null;
  language: string | null;
  link: string | null;
  note: string | null;
  star_1_score: number;
  star_2_score: number;
  star_1_index: number | null;
  star_2_index: number | null;
};

type s_Pause = {
  id: number;
  day: number;
  year: number;
  leaderboard_id: number;
  user_id: number;
  parent_id: number | null;
  type: 'pause' | 'resume';
  time: Date;
};

type TotalTime = {
  totalTime: number,
  lastTimestamp?: string
  time_to_first_star: number | null,
  time_to_second_star: number | null
}

type LeaderboardUserMap = {
  [id: number]: {
    display_name: string,
    score: number,
    link: string,
    avatar_color: AvatarColor
  }
}

type LeaderboardInfo = {
  [year: number]: {
    [day: number]: {
      [user_id: number]: {
        start_time: string,
        star_1_end_time: string | null,
        star_2_end_time: string | null,
        total_time: TotalTime,
        link: string | null,
        note: string | null,
        language: string | null,
        score: number
      }
    }
  }
}
