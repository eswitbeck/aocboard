import twMerge from 'tailwind-merge';

export default async function Home() {
  const message = 'eat my shorts';

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
}
