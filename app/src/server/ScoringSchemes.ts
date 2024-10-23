export type SubmissionTimes = {
  user_id: number;
  total_time: TotalTime;
};

export type ScoredSubmission = {
  user_id: number;
  score: number;
};

type SortingField = 'time_to_first_star' | 'time_to_second_star';

const sortByField = (
  submissions: SubmissionTimes[],
  field: SortingField
) => {
  return submissions.sort((a, b) => {
    if (!a.total_time[field]) return 1;
    if (!b.total_time[field]) return -1;
    return a.total_time[field]! - b.total_time[field]!;
  });
}

export const SCORING_SCHEMES = {
  'tier': (submissions: SubmissionTimes[]): ScoredSubmission[] => {
    const scores = [5, 2, 1];
    const results = new Map<number, number>(); // user_id -> score

    for(const field of [
      'time_to_first_star',
      'time_to_second_star'
    ] as SortingField[]) {
      sortByField(submissions, field).forEach((sub, i) => {
        const score = sub.total_time[field] ?
          (scores[i] || 0) : 0;
        results.set(sub.user_id, (results.get(sub.user_id) || 0) + score);
      });
    }

    return Array.from(results)
      .map(([user_id, score]) => ({ user_id, score }));
  },
  'proportional': (submissions: SubmissionTimes[]): ScoredSubmission[] => {
    const results = new Map<number, number>(); // user_id -> score
    
    for(const field of [
      'time_to_first_star',
      'time_to_second_star'
    ] as SortingField[]) {
      const sorted = sortByField(submissions, field);
      const fastest = sorted[0];
      if (!fastest.total_time[field]) continue;
      sorted.forEach(sub => {
        if (!sub.total_time[field]) return;
        const score = 100 * (fastest.total_time[field]! / sub.total_time[field]!);
        results.set(sub.user_id, (results.get(sub.user_id) || 0) + score);
      });
    }

    return Array.from(results)
      .map(([user_id, score]) => ({ user_id, score }));
  }
};
