'use client';
import { useState, useEffect } from 'react';

export default function LanguageInput({
  selectedLanguage,
  languages,
  updateLanguage
}: {
  selectedLanguage: string | null,
  languages: { name: string, id: number }[],
  updateLanguage: (id: number) => void
}) {
  const [lang, setLang] = useState('');

  useEffect(() => {
    setLang(selectedLanguage ?? '');
  }, [selectedLanguage]);

  return (
    <select>
      <option
        value=""
        onClick={() => {
          setLang('');
          updateLanguage(0);
        }}
      >
        Select language
      </option>
      {languages.map(({ name: language, id }) => (
        <option
          key={language}
          value={language}
          selected={language === lang}
          onClick={() => {
            setLang(language);
            updateLanguage(id);
          }}
        >
          {language}
        </option>
      ))}
    </select>
  );
}
