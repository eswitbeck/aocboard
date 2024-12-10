import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { CheckIcon } from '@heroicons/react/20/solid';

import { H3, Base, Small } from '../../core/text';

import Modal from '../Modal';

export default function Language({
  isOpen,
  close,
  currentLink,
  updateLink
}: {
  isOpen: boolean;
  close: () => void;
  currentLink: string | null;
  updateLink: (note: string) => void;
}) {
  const [linkBuffer, setLinkBuffer] = useState<string | null>(
    currentLink || ''
  );

  const isOverflow = (linkBuffer || '').length > 255;

  const handleClose = () => {
    close();
    setLinkBuffer(currentLink)
  }

  const handleSubmit = () => {
    if (isOverflow) {
      return;
    }

    if (linkBuffer !== currentLink) {
      const link = linkBuffer || '';
      if (!link) {
        updateLink(link);
        return;
      }
      if (link.startsWith('http://') ||
          link.startsWith('https://')
      ) {
        updateLink(link);
      } else if (link.length < 248) {
        updateLink(`https://${link}`);
        setLinkBuffer(`https://${link}`);
      } else {
        updateLink(link);
      }
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
          Add Link
        </H3>
        <div className={twMerge(
          "flex flex-col gap-2 p-4 py-2",
          "bg-gray-800 rounded-md",
          "overflow-y-auto",
          isOverflow && 'ring-2 ring-red-500'
        )}>
          <input type="text" className={twMerge(
              "w-full h-full",
              "bg-transparent",
              "text-white",
              "resize-none",
              "focus:outline-none",
              "placeholder-gray-600",
            )}
            value={linkBuffer || ''}
            onChange={(e) => setLinkBuffer(e.target.value)}
            placeholder="Add a link to your solution"
          />
        </div>
        <Small className={twMerge(
          'font-bold',
          isOverflow ? 'text-red-500' : 'text-gray-400',
        )}>
          {linkBuffer?.length || 0} / 255
        </Small>
      </div>
    </Modal>
    );
  }
