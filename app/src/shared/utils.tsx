export const timestamp2Clock = (diff: number | null): string | null => {
  if (null === diff) {
    return null;
  }

  const hours = `${Math.floor(diff / 60 / 60 / 1000)}`
    .padStart(2, '0');
  const minutes = `${Math.floor(diff / 60 / 1000) % 60}`
    .padStart(2, '0');
  const seconds = `${Math.floor(diff / 1000) % 60}`
    .padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

export const timeString2Timestamp = (time: string | null): number | null => {
  if (!time) {
    return null;
  }
  return new Date(time).getTime();
}

/** NB Returns in Local Time */
export const timestamp2TimeString = (
  timestamp: string | null
): string | null => {
  if (!timestamp) {
    return null;
  }
  return new Date(timestamp)
    .toLocaleDateString(
      'en-us',
       {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit'
       }
    );
}
