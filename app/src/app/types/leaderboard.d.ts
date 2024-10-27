type UsersArray = {
  id: number;
  display_name: string;
  score: number;
  link: string | null;
  avatar_color: AvatarColor;
}[];

type SubmissionFetcher = (
  userId: number,
  day: number,
  year: number,
  leaderboard: number
) => Promise<{
  body?: {
    total_time: TotalTime;
  } 
} & HTTPLike<Submission | null>>;

type EmptySubmissionFetcher = () => Promise<{
  body?: {
    total_time: TotalTime;
  } 
} & HTTPLike<Submission | null>>;
