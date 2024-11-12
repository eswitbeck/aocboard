'use client';
import { twMerge } from 'tailwind-merge';

import {
  ChatBubbleBottomCenterTextIcon,
  LinkIcon,
  DocumentDuplicateIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

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
    "p-2 rounded-2xl",
    isDisabled ? "bg-gray-700" : "bg-gray-600 cursor-pointer"
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
      </div>
      <div
        className={divClasses}
        onClick={isDisabled ? () => {} : toggleLinkModal}
      >
        <LinkIcon className={twMerge(
          classes
        )} />
      </div>
      <div
        className={divClasses}
        onClick={isDisabled ? () => {} : toggleCopyModal}
      >
        <DocumentDuplicateIcon className={twMerge(
          classes
        )} />
      </div>
      <div
        className={divClasses}
        onClick={isDisabled ? () => {} : toggleLanguageModal}
      >
        <CodeBracketIcon className={twMerge(
          classes
        )} />
      </div>
    </div>
  );
}
