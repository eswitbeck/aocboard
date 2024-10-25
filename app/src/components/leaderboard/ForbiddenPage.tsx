import { twMerge } from 'tailwind-merge'
import Link from 'next/link';

import { Button } from '@/components/core/button';
import { H1, H3, Base } from '@/components/core/text';

export default function ForbiddenPage() {
  return (
    <div className="flex justify-center h-screen p-4">
      <div className="flex flex-col gap-4 mt-32 mx-4">
        <div className={twMerge(
          "p-4 rounded-xl flex flex-col gap-4",
          "bg-gray-700"
        )}>
          <H1>
            Nothing to see here
          </H1>
          <Base className="text-gray-300">
            Either you don&apos;t have permission to view this page, or it doesn&apos;t exist.
          </Base>
          <Link href="/">
            <Button color="orange">
              Go back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
