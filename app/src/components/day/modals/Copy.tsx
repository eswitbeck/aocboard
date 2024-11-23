import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { CheckIcon } from '@heroicons/react/20/solid';

import { H3, Base } from '../../core/text';

import Modal from '../Modal';

export default function Copy({
  isOpen,
  close,
  leaderboardDayStatus,
  copyDay
}: {
  isOpen: boolean;
  close: () => void;
  leaderboardDayStatus: LeaderboardDayStatus[];
  copyDay: (targetLeaderboardIds: number[]) => Promise<boolean[]>;
}) {

  const init = leaderboardDayStatus.reduce((acc, status) => {
    acc[status.id] = status.exists;
    return acc;
  }, {} as { [key: number]: boolean });

  const [selectedLeaderboards, setSelectedLeaderboards] = useState<{
    [key: number]: boolean;
  }>({});
  const [hasRecords, setHasRecords] = useState<{
    [key: number]: boolean;
  }>(leaderboardDayStatus.reduce((acc, status) => {
    acc[status.id] = status.exists;
    return acc;
  }, {} as { [key: number]: boolean }));

  const handleClose = () => {
    close();
    setSelectedLeaderboards({});
    setHasRecords(leaderboardDayStatus.reduce((acc, status) => {
      acc[status.id] = status.exists;
      return acc;
    }, {} as { [key: number]: boolean }));
  }

  const handleSubmit = async () => {
    const targetLeaderboardIds = leaderboardDayStatus
      .filter(status => selectedLeaderboards[status.id])
      .map(status => status.id);
    const status = await copyDay(targetLeaderboardIds);
    if (status) {
      setHasRecords({
        ...hasRecords,
        ...status.reduce((
          acc: { [key: number]: boolean },
          s: boolean,
          i: number
        ) => {
          acc[targetLeaderboardIds[i]] = s;
          return acc;
        }, {} as { [key: number]: boolean })
      });
    }
    setSelectedLeaderboards({});
    close();
  }

  return (
    <Modal isOpen={isOpen} close={handleClose} submit={handleSubmit}>
      <div className={twMerge(
         "flex flex-col gap-4",
      )}>
        <H3 className="text-3xl mt-0">
          Copy times
        </H3>
        <Base className="text-gray-300">
          Copying times will overwrite any existing times on the selected leaderboards.
        </Base>
        <div className={twMerge(
          "flex flex-col gap-2 p-4",
          "bg-gray-800 rounded-md",
          "max-h-[45vh]",
          "overflow-y-auto",
          "mt-4",
        )}>
          {leaderboardDayStatus.map((status, i) => (
            <div className="flex flex-col gap-2" key={status.id}>
              <div
                className="flex gap-3"
                onClick={() => {
                  setSelectedLeaderboards({
                    ...selectedLeaderboards,
                    [status.id]: !selectedLeaderboards[status.id]
                  });
                }}
              >
                <div className={twMerge(
                  "w-6 h-6 bg-gray-600 rounded-md",
                  "flex items-center justify-center",
                )}>
                  {selectedLeaderboards[status.id] && (
                    <CheckIcon className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <Base>
                  {status.name}
                </Base>
              </div>
              {hasRecords[status.id] && (
                <Base className="text-sm text-gray-400 mb-3">
                  (Has records)
                </Base>
              )}
            </div>
          ))}
          {leaderboardDayStatus.length === 0 && (
            <Base className="text-gray-400">
              No other leaderboards to copy to right now!
            </Base>
          )}
        </div>
      </div>
    </Modal>
  );
}
