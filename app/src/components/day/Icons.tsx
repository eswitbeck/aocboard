'use client';
import { twMerge } from 'tailwind-merge';

import {
  ChatBubbleBottomCenterTextIcon,
  LinkIcon,
  DocumentDuplicateIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

import {
  Small
} from '@/components/core/text';

export default function Icons({
  isDisabled,
  toggleCommentModal,
  toggleLinkModal,
  toggleCopyModal,
  toggleLanguageModal
}: {
  isDisabled: boolean,
  toggleCommentModal?: () => void,
  toggleLinkModal?: () => void,
  toggleCopyModal?: () => void,
  toggleLanguageModal?: () => void
}) {
  const divClasses = twMerge(
    "p-1 rounded-2xl",
    "h-14 w-14",
    isDisabled ? "bg-gray-700" : "bg-gray-600 cursor-pointer",
    "flex flex-col justify-center items-center"
  );
  const classes = twMerge(
    "w-8 h-8",
    isDisabled ? "text-gray-600" : "text-gray-400"
  );

  return (
    <div className="flex gap-4 justify-center items-center mt-4">
      <div
        className={divClasses}
        onClick={isDisabled ? () => {} : toggleCommentModal}
      >
        <ChatBubbleBottomCenterTextIcon className={twMerge(
          classes
        )} />
        <Small className={twMerge(
          isDisabled ? "text-gray-600" : "text-gray-400"
        )}>
          Note
        </Small>
      </div>
      <div
        className={divClasses}
        onClick={isDisabled ? () => {} : toggleLinkModal}
      >
        <LinkIcon className={twMerge(
          classes
        )} />
        <Small className={twMerge(
          isDisabled ? "text-gray-600" : "text-gray-400"
        )}>
          Link
        </Small>
      </div>
      <div
        className={divClasses}
        onClick={isDisabled ? () => {} : toggleCopyModal}
      >
        <DocumentDuplicateIcon className={twMerge(
          classes
        )} />
        <Small className={twMerge(
          isDisabled ? "text-gray-600" : "text-gray-400"
        )}>
          Copy
        </Small>
      </div>
      <div
        className={divClasses}
        onClick={isDisabled ? () => {} : toggleLanguageModal}
      >
        <CodeBracketIcon className={twMerge(
          classes
        )} />
        <Small className={twMerge(
          isDisabled ? "text-gray-600" : "text-gray-400"
        )}>
          Lang.
        </Small>
      </div>
    </div>
  );
}
