import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { addLanguage as addLanguageApi } from '@/server/Main';

import {
  CheckIcon,
  PlusIcon,
} from '@heroicons/react/20/solid';

import { H3, Base } from '../../core/text';

import Modal from '../Modal';

export default function Language({
  userId,
  isOpen,
  close,
  currentLanguage,
  languages,
  updateLanguage,
}: {
  userId: number;
  isOpen: boolean;
  close: () => void;
  currentLanguage: string | null;
  languages: { id: number; name: string }[];
  updateLanguage: (languageId: number) => void;
}) {
  // this is so dumb vv
  const currentLanguageId = languages.find(
    (language) => language.name === currentLanguage
  )?.id;

  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(
    currentLanguageId || null
  );

  const handleClose = () => {
    close();
    setSelectedLanguage(currentLanguageId || null);
  }

  const handleAddLanguage = async (
    name: string,
    languages: { id: number; name: string }[]
  ) => {
    const resp = await addLanguageApi(userId, name);
    if (resp.status !== 201) {
      return;
    }
    const { id } = resp.body!.data;
    // dangerously mutate
    languages.push({ id, name });
  }

  const [newLanguageBuffer, setNewLanguageBuffer] = useState('');

  const handleSubmit = () => {
    if (selectedLanguage !== null) {
      updateLanguage(selectedLanguage);
    }
    close();
  }

  return (
    <Modal isOpen={isOpen} close={handleClose} submit={handleSubmit}>
      <div className={twMerge(
         "flex flex-col gap-4",
      )}>
        <H3 className="text-3xl mt-0">
          Add Language
        </H3>
        <div className={twMerge(
          "flex flex-col gap-2 p-4",
          "bg-gray-800 rounded-md",
          "max-h-[45vh]",
          "overflow-y-auto",
          "mt-4",
        )}>
          {[
              { id: 0, name: 'None selected' },
              ...languages,
            ].map((language) => (
            <div
              className="flex gap-3"
              key={language.id}
              onClick={() => setSelectedLanguage(language.id)}
            >
              <div className={twMerge(
                "w-6 h-6 bg-gray-600 rounded-md",
                "flex items-center justify-center",
              )}>
                {(selectedLanguage === language.id ||
                  (selectedLanguage === null && language.id === 0)) && (
                  <CheckIcon className="w-5 h-5 text-orange-500" />
                )}
              </div>
              <Base>
                {language.name}
              </Base>
            </div>
          ))}
          <div className="flex gap-3 items-center">
            <div className={twMerge(
              "w-6 h-6 bg-gray-700 rounded-md",
              "flex items-center justify-center",
              "flex-shrink-0",
            )}/>
            <input
              className={twMerge(
                "w-full bg-transparent",
                "focus:outline-none",
                "placeholder-gray-500",
                "px-2 py-1 bg-gray-700 rounded-md",
                "min-w-[150px]",
                "focus:ring-2 focus:ring-orange-500",
              )}
              placeholder="Add language"
              value={newLanguageBuffer}
              onChange={(e) => setNewLanguageBuffer(e.target.value)}
            />
            <button
              className={twMerge(
                "ml-2",
                "text-gray-400",
                "hover:text-gray-300",
                "bg-gray-700",
                "rounded-md p-1 px-2",
                "focus:outline-none",
                "focus:ring-2 focus:ring-orange-500",
              )}
              onClick={() => {
                handleAddLanguage(newLanguageBuffer, languages);
                setNewLanguageBuffer('');
              }}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
    );
  }
