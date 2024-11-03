import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import {
  timestamp2Clock,
  timestamp2TimeString
} from '@/shared/utils';

import {
  getUserIdFromAccessToken,
  getSubmission,
  pauseSubmission,
  resumeSubmission,
  restartSubmission,
  completeSubmission,
  updatePause,
  updateStartTime,
  updateStarTime,
  getLanguages,
  updateLanguage,
  updateSubmission,
  getSelf
} from '@/server/Main';

import {
  Base,
  H1,
  H3,
  A
} from '@/components/core/text';

import Avatar from '@/components/shared/Avatar';

import PreStartPage from '@/components/day/PreStartPage';



import Clock from '@/app/_components/Clock';
import LanguageInput from '@/app/_components/LanguageInput';
import PausesList from '@/app/_components/PausesList';
import RedirectLogin from '@/app/_components/RedirectLogin';
import ServerActionButton from '@/app/_components/ServerActionButton';
import Stars from '@/app/_components/Stars';
import SubmissionInputs from '@/app/_components/SubmissionInputs';

export default async function SubmissionPage({
  params: {
    leaderboard,
    year,
    day
  }
}: {
  params: {
    leaderboard: number,
    year: number,
    day: number
  }
}) {
  const time = new Date();
  if (year < 2015 || year > time.getFullYear() || day < 1 || day > 25) {
    redirect(`/${leaderboard}`);
  }

  const userId = await getUserIdFromAccessToken();

  const currentUserResp = await getSelf(userId);

  const submissionResponse = await getSubmission(
    userId,
    day,
    year,
    leaderboard
  );

  if (submissionResponse.status === 401) {
    return <RedirectLogin />;
  }

  const currentUser = currentUserResp.body!.data;

  if (submissionResponse.status === 403) {
    return (
      <div>
        <p>
          Either you aren&apos;t on this leaderboard or it doesn&apos;t exist!
        </p>
        <Link href={`/`}>
          Go home
        </Link>
      </div>
    );
  }

  if (submissionResponse.status === 404) {
    return (
      <>
        <PreStartPage
          currentUser={currentUser}
          userId={userId}
          day={day}
          year={year}
          leaderboard={leaderboard}
        />
      </>
    );
  }

  if (submissionResponse.status >= 400) {
    return <ErrorPage error={submissionResponse.error} />;
  }

  const submission = submissionResponse.body?.data!;
  // @ts-ignore -- dangerous ignore here
  const totalTime = submissionResponse.body?.total_time!;

  const isComplete = submission.star_2_end_time !== null;
  const isPaused = !Object.hasOwn(totalTime, 'lastTimestamp');

  if (isComplete) {
    return (
      <>
        <Header
          currentUser={currentUser}
          leaderboard={leaderboard}
          day={day}
          year={year}
        />
        <CompletePage
          totalTime={totalTime}
          submission={submission}
          userId={userId}
          day={day}
          year={year}
          leaderboard={leaderboard}
        />
      </>
    );
  }
  if (!isPaused) {
    return (
      <>
        <Header
          currentUser={currentUser}
          leaderboard={leaderboard}
          day={day}
          year={year}
        />
        <ActivePage
          time={time}
          totalTime={totalTime}
          submission={submission}
          userId={userId}
          day={day}
          year={year}
          leaderboard={leaderboard}
        />
      </>
    );
  }

  return (
    <>
      <Header
        currentUser={currentUser}
        leaderboard={leaderboard}
        year={year}
        day={day}
      />
      <PausedPage
        totalTime={totalTime}
        submission={submission}
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
    </>
  );
}

async function ActivePage({
  time,
  totalTime,
  submission,
  userId,
  day,
  year,
  leaderboard
}: {
  time: Date,
  totalTime: TotalTime,
  submission: Submission,
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {
  const languages = await getLanguages();
  if (languages.status >= 400) {
    return <ErrorPage error={languages.error} />;
  }

  return (
    <div>
      <Clock
        startingDiff={totalTime.totalTime +
          time.getTime() -
          new Date(totalTime.lastTimestamp!).getTime()}
      />
      <PauseButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
      <RestartButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
      <GetStarButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
      <Stars
        submission={submission}
        updateStar={async (time, star) => {
          'use server';
          updateStarTime(
            userId,
            day,
            year,
            leaderboard,
            time,
            star
          );
          revalidatePath('/');
        }}
      />
      <PausesList
        pauses={submission.pauses}
        start_time={submission.start_time}
        updatePause={async (pauseId, time) => {
          'use server';
          updatePause(userId, pauseId, time);
          revalidatePath('/');
        }}
        updateStart={async (time) => {
          'use server';
          updateStartTime(
            userId,
            day,
            year,
            leaderboard,
            time
          );
          revalidatePath('/');
        }}
      />
      <LanguageInput
        selectedLanguage={submission.language}
        languages={languages.body!.data}
        updateLanguage={async (id) => {
          'use server';
          updateLanguage(userId, day, year, leaderboard, id);
          revalidatePath('/');
        }}
      />
      <SubmissionInputs
        submission={submission}
        updateSubmission={async (field, value) => {
          'use server';
          updateSubmission(userId, day, year, leaderboard, field, value);
          revalidatePath('/');
        }}
      />
    </div>
  );
}


async function PausedPage({
  totalTime,
  submission,
  userId,
  day,
  year,
  leaderboard
}: {
  totalTime: TotalTime,
  submission: Submission,
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {
  const languages = await getLanguages();

  return (
    <div className="flex flex-col gap-2">
      <p>Paused</p>
      <p>{timestamp2Clock(totalTime.totalTime)}</p>
      <ResumeButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
      <RestartButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
      <Stars
        submission={submission}
        updateStar={async (time, star) => {
          'use server';
          updateStarTime(userId, day, year, leaderboard, time, star);
          revalidatePath('/');
        }}
      />
      <PausesList
        pauses={submission.pauses}
        start_time={submission.start_time}
        updatePause={async (pauseId, time) => {
          'use server';
          updatePause(userId, pauseId, time);
          revalidatePath('/');
        }}
        updateStart={async (time) => {
          'use server';
          updateStartTime(
            userId,
            day,
            year,
            leaderboard,
            time
          );
          revalidatePath('/');
        }}
      />
      <LanguageInput
        selectedLanguage={submission.language}
        languages={languages.body!.data}
        updateLanguage={async (id) => {
          'use server';
          updateLanguage(userId, day, year, leaderboard, id);
          revalidatePath('/');
        }}
      />
      <SubmissionInputs
        submission={submission}
        updateSubmission={async (field, value) => {
          'use server';
          updateSubmission(userId, day, year, leaderboard, field, value);
          revalidatePath('/');
        }}
      />
    </div>
  );
}


function ErrorPage({ error }: { error: string }) {
  return (
    <div>
      Error: {error}
    </div>
  );
}

async function CompletePage({
  totalTime,
  submission,
  userId,
  day,
  year,
  leaderboard
}: {
  totalTime: TotalTime,
  submission: Submission,
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {
  const languages = await getLanguages();

  return (
    <div>
      <p>Complete!</p>
      <p>{timestamp2Clock(totalTime.totalTime)}</p>
      <RestartButton
        userId={userId}
        day={day}
        year={year}
        leaderboard={leaderboard}
      />
      <Stars
        submission={submission}
        updateStar={async (time, star) => {
          'use server';
          updateStarTime(userId, day, year, leaderboard, time, star);
          revalidatePath('/');
        }}
      />
      <PausesList
        pauses={submission.pauses}
        start_time={submission.start_time}
        updatePause={async (pauseId, time) => {
          'use server';
          updatePause(userId, pauseId, time);
          revalidatePath('/');
        }}
        updateStart={async (time) => {
          'use server';
          updateStartTime(
            userId,
            day,
            year,
            leaderboard,
            time
          );
          revalidatePath('/');
        }}
      />
      <LanguageInput
        selectedLanguage={submission.language}
        languages={languages.body!.data}
        updateLanguage={async (id) => {
          'use server';
          updateLanguage(userId, day, year, leaderboard, id);
          revalidatePath('/');
        }}
      />
      <SubmissionInputs
        submission={submission}
        updateSubmission={async (field, value) => {
          'use server';
          updateSubmission(userId, day, year, leaderboard, field, value);
          revalidatePath('/');
        }}
      />
    </div>
  );
}


function PauseButton({
  userId,
  day,
  year,
  leaderboard
}: {
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {
  return (
    <ServerActionButton
      fn={async () => {
        'use server';
        const response = await pauseSubmission(userId, day, year, leaderboard);
        revalidatePath('/');
      }}
    >
      Pause
    </ServerActionButton>
  );
}

function ResumeButton({
  userId,
  day,
  year,
  leaderboard
}: {
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {
  return (
    <ServerActionButton
      fn={async () => {
        'use server';
        const response = await resumeSubmission(userId, day, year, leaderboard);
        revalidatePath('/');
      }}
    >
      Resume
    </ServerActionButton>
  );
}

function GetStarButton({
  userId,
  day,
  year,
  leaderboard
}: {
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {
  return (
    <ServerActionButton
      fn={async () => {
        'use server';
        const response = await completeSubmission(userId, day, year, leaderboard);
        revalidatePath('/');
      }}
    >
      Claim star!
    </ServerActionButton>
  );
}

function RestartButton({
  userId,
  day,
  year,
  leaderboard
}: {
  userId: number | null,
  day: number,
  year: number,
  leaderboard: number
}) {
  return (
    <div className="flex flex-col gap-2 max-w-max px-2 py-1">
      <p>Didn&apos;t mean to start?</p>
      <ServerActionButton
        fn={async () => {
          'use server';
          const response = await restartSubmission(userId, day, year, leaderboard);
          revalidatePath('/');
        }}
      >
        Restart
      </ServerActionButton>
    </div>
  );
}

function Header ({
  currentUser,
  leaderboard,
  day,
  year
}: {
    currentUser: {
    display_name: string,
    avatar_color: AvatarColor,
  },
  leaderboard: number,
  day: number,
  year: number
  // TODO also need leaderboard name and owner (with name and color)
}) {
  return (
    <div className={twMerge(
        "w-full min-h-16",
        "p-2 px-4",
        "flex justify-center items-center gap-2", 
        "lg:hidden",
        "pt-[15px]", // for header
      )}
    >
      <Link href={`/${leaderboard}`}>
        <div className={twMerge(
          "flex justify-center items-center",
          "rounded-lg bg-gray-700 px-4 py-2",
          "w-11 h-11"
        )}>
          <Base className="text-xl font-bold">
            {'<'}
          </Base>
        </div>
      </Link>
       
      <div className={twMerge(
        "flex w-full justify-center items-center"
      )}>
        <div className="flex flex-col gap-1 items-center">
          <H1 className="my-0 text-gray-200">
            Day {day}
          </H1>
          <H3 className="my-0 text-gray-400">
            {year}
          </H3>
        </div>
      </div>

      <Link href="/">
        <div className={twMerge(
          "flex justify-center items-center",
          "rounded-lg bg-gray-700 px-4 py-2",
          "w-11 h-11"
        )}>
          <Avatar
            size="sm"
            className="outline-gray-700"
            user={{
              display_name: currentUser.display_name,
              link: '/',
              avatar_color: currentUser.avatar_color
            }}
          />
        </div>
      </Link>
    </div>
  );
}
