'use client';
import { useState, useEffect } from 'react';

export default function SubmissionInputs({
  submission,
  updateSubmission
}: {
  submission: Submission;
  updateSubmission: (field: 'note' | 'link', value: string) => void;
}) {
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    setLink(submission.link ?? '');
    setNote(submission.note ?? '');
  }, [submission.link]);

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Add link?"
        value={link}
        onChange={(e) => {
          setLink(e.target.value);
        }}
        onBlur={() => {
          updateSubmission('link', link);
        }}
      />
      <textarea
        placeholder="Add note?"
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
        }}
        onBlur={() => {
          updateSubmission('note', note);
        }}
      />
    </div>
  );
}
