'use client';

export default function InvitationUpdate({
  updateInvitation
}: {
  updateInvitation: (
    expiresAt: '1 day' | '1 week' | '1 month' | '1 year' | 'never' | 'now'
  ) => void;
}) {
  return (
    <div className="flex gap-2">
      <button onClick={() => updateInvitation('1 day')}>1 day</button>
      <button onClick={() => updateInvitation('1 week')}>1 week</button>
      <button onClick={() => updateInvitation('1 month')}>1 month</button>
      <button onClick={() => updateInvitation('1 year')}>1 year</button>
      <button onClick={() => updateInvitation('never')}>never</button>
      <button onClick={() => updateInvitation('now')}>now</button>
    </div>
  );
}
