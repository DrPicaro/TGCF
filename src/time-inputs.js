export function durationFromParts(minutesInput, secondsInput) {
  const minutesText = String(minutesInput ?? '').trim();
  const secondsText = String(secondsInput ?? '').trim();
  if (!minutesText && !secondsText) return null;
  if (!/^\d+$/.test(minutesText) || !/^\d+$/.test(secondsText)) return null;
  const minutes = Number(minutesText);
  const seconds = Number(secondsText);
  if (seconds > 59) return null;
  return minutes * 60 + seconds;
}

export function durationToParts(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || !Number.isFinite(Number(totalSeconds))) {
    return { minutes: '', seconds: '' };
  }
  const value = Math.round(Number(totalSeconds));
  if (value < 0) return { minutes: '', seconds: '' };
  return {
    minutes: String(Math.floor(value / 60)),
    seconds: String(value % 60).padStart(2, '0'),
  };
}
