export type SubmissionTimes = {
  user_id: number;
  total_time: TotalTime;
};

export type ScoredSubmission = {
  user_id: number;
  star_1_score: number;
  star_1_index: number | null;
  star_2_score: number;
  star_2_index: number | null;
};

type Score = {
  star_1: StarDetails;
  star_2: StarDetails;
};

type StarDetails = {
  score: number;
  index: number | null;
};

const defaultScore = {
  star_1: { score: 0, index: null },
  star_2: { score: 0, index: null }
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
    const results = new Map<number, Score>(); // user_id -> score

    for(const field of [
      'time_to_first_star',
      'time_to_second_star'
    ] as SortingField[]) {
      sortByField(submissions, field).forEach((sub, i) => {
        const score = sub.total_time[field] ?
          (scores[i] || 0) : 0;
        const prevScore = results.get(sub.user_id) || defaultScore;
        switch(field) {
          case 'time_to_first_star':
            prevScore.star_1 = score > 0 ? { score, index: i } : prevScore.star_1;
            break;
          case 'time_to_second_star':
            prevScore.star_2 = score > 0 ? { score, index: i } : prevScore.star_2;
            break;
        }
        results.set(sub.user_id, prevScore);
      });
    }

    return Array.from(results)
      .map(([user_id, score]) => ({
        user_id,
        star_1_score: score.star_1.score,
        star_1_index: score.star_1.index,
        star_2_score: score.star_2.score,
        star_2_index: score.star_2.index
      }));
  },
  'proportional': (submissions: SubmissionTimes[]): ScoredSubmission[] => {
    const results = new Map<number, Score>(); // user_id -> score
    
    for(const field of [
      'time_to_first_star',
      'time_to_second_star'
    ] as SortingField[]) {
      const sorted = sortByField(submissions, field);
      const fastest = sorted[0];
      if (!fastest.total_time[field]) continue;
      sorted.forEach((sub, i) => {
        if (!sub.total_time[field]) return;
        const score = 100 * (fastest.total_time[field]! / sub.total_time[field]!);
        const prevScore = results.get(sub.user_id) || { ...defaultScore };
        switch(field) {
          case 'time_to_first_star':
            prevScore.star_1 = { score, index: i };
            break;
          case 'time_to_second_star':
            prevScore.star_2 = { score, index: i };
            break;
        }
        results.set(sub.user_id, prevScore);
      });
    }

    return Array.from(results)
      .map(([user_id, score]) => ({
        user_id,
        star_1_score: score.star_1.score,
        star_1_index: score.star_1.index,
        star_2_score: score.star_2.score,
        star_2_index: score.star_2.index
      }));
  }
};
