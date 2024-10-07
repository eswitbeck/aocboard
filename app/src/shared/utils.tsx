export const convertToTimeString = (diff: number | null): string | null => {
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

