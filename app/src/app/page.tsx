import {
  startSubmission,
  getSubmission
} from '@/server/Main';

export default async function Home() {
  const submission = await getSubmission(1, 1, 1, 1);
  const now = new Date().getTime();
  const start = submission.body?.data.start_time;

  const diff = !start ? null : now - start;

  return (
    <div>
      {diff && new Date(diff).toLocaleDateString(undefined,
        { hour: 'numeric', minute: 'numeric', second: 'numeric'})}
    </div>
  );
}
