/** Returns unix timestamp in milliseconds */
export const getCurrentUTCTime = () => {
  return new Date()
    .toISOString()
    .slice(0, 23)
    .replace('T', ' ');
}
