import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { CheckIcon } from '@heroicons/react/20/solid';

import { H3, Base, Small } from '../../core/text';

import Modal from '../Modal';

export default function Language({
  isOpen,
  close,
  currentNote,
  updateNote
}: {
  isOpen: boolean;
  close: () => void;
  currentNote: string | null;
  updateNote: (note: string) => void;
}) {
  const [noteBuffer, setNoteBuffer] = useState<string | null>(
    currentNote || ''
  );

  const isOverflow = (noteBuffer || '').length > 255;

  const handleClose = () => {
    close();
    setNoteBuffer(currentNote)
  }

  const handleSubmit = () => {
    if (isOverflow) {
      return;
    }

    if (noteBuffer !== currentNote) {
      updateNote(noteBuffer || '');
    }
    close();
  }

  return (
    <Modal
      isOpen={isOpen}
      close={handleClose}
      submit={handleSubmit}
      submitIsDisabled={isOverflow}
    >
      <div className={twMerge(
         "flex flex-col gap-4",
      )}>
        <H3 className="text-3xl mt-0">
          Add Note
        </H3>
        <div className={twMerge(
          "flex flex-col gap-2 p-4",
          "bg-gray-800 rounded-md",
          "h-[40vh]",
          "overflow-y-auto",
          "mt-4",
          isOverflow && 'ring-2 ring-red-500'
        )}>
          <textarea
            className={twMerge(
              "w-full h-full",
              "bg-transparent",
              "text-white",
              "resize-none",
              "focus:outline-none",
            )}
            value={noteBuffer || ''}
            onChange={(e) => setNoteBuffer(e.target.value)}
          />
        </div>
        <Small className={twMerge(
          'font-bold',
          isOverflow ? 'text-red-500' : 'text-gray-400',
        )}>
          {noteBuffer?.length || 0} / 255
        </Small>
      </div>
    </Modal>
    );
  }
