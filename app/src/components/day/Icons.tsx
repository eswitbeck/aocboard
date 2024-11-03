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
  const divClasses="p-2 rounded-2xl bg-gray-700";
  const classes=twMerge(
    "w-8 h-8",
    isDisabled ? "text-gray-600" : "text-gray-400"
  );

  return (
    <div className="flex gap-4 justify-center items-center">
      <div
        className={divClasses}
        onClick={toggleCommentModal}
      >
        <ChatBubbleBottomCenterTextIcon className={twMerge(
          classes
        )} />
      </div>
      <div
        className={divClasses}
        onClick={toggleLinkModal}
      >
        <LinkIcon className={twMerge(
          classes
        )} />
      </div>
      <div
        className={divClasses}
        onClick={toggleCopyModal}
      >
        <DocumentDuplicateIcon className={twMerge(
          classes
        )} />
      </div>
      <div
        className={divClasses}
        onClick={toggleLanguageModal}
      >
        <CodeBracketIcon className={twMerge(
          classes
        )} />
      </div>
    </div>
  );
}
