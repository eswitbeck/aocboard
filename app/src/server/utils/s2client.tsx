/** Presumes all s_Pauses point to the same s_Submission, and that all resumes
* * succeed their respective pauses
* */
export const s_Submission2Submission = (
  s_Submission: s_Submission,
  s_Pauses: s_Pause[]
): Submission => {
  const pauseMap: Record<number, Pause> = {};
  for (const s_Pause of s_Pauses) {
    if (s_Pause.type === 'pause') {
      pauseMap[s_Pause.id] = {
        id: s_Pause.id,
        start_time: s_Pause.time,
        end_time: null
      };
    } else if (null === s_Pause.id) {
      continue;
    } else {
      if (!Object.hasOwn(pauseMap, s_Pause.parent_id!)) {
        throw new Error('resume without pause');
      }
      pauseMap[s_Pause.parent_id!].end_time = s_Pause.time;
    }
  }

  const pauses: Pause[] = Object.values(pauseMap).sort(
    (a, b) => a.start_time - b.start_time
  );

  return {
    user_id: s_Submission.user_id,
    day: s_Submission.day,
    year: s_Submission.year,
    leaderboard_id: s_Submission.leaderboard_id,
    start_time: new Date(s_Submission.start_time).getTime(),
    star_1_time: null === s_Submission.star_1_time
      ? null
      : new Date(s_Submission.star_1_time).getTime(),
    star_2_time: null === s_Submission.star_2_time
      ? null
      : new Date(s_Submission.star_2_time).getTime(),
    language: s_Submission.language,
    link: s_Submission.link,
    note: s_Submission.note,
    pauses
  };
}
