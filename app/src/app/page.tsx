import {
  startSubmission
} from '@/server/Main';

export default async function Home() {
  const submission = await startSubmission(1, 1, 1, 1);
  return (
    <div>
      {JSON.stringify(
        submission.body?.data,
        null,
        2
      )}
    </div>
  );
}
