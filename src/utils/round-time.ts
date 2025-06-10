/**
 * Rounds a Date to the nearest time interval
 * @param date The date to round
 * @param roundTo The interval to round to
 * @returns A new Date object with the rounded time
 */
export function roundTime(
  date: Date,
  roundTo: 'NONE' | '10_MINUTES' | '15_MINUTES' | '30_MINUTES' | '1_HOUR',
): Date {
  if (roundTo === 'NONE') {
    return new Date(date);
  }

  const roundedDate = new Date(date);
  const minutes = roundedDate.getMinutes();
  const seconds = roundedDate.getSeconds();
  const milliseconds = roundedDate.getMilliseconds();

  // Always round up if there are any seconds or milliseconds
  const shouldRoundUp = seconds > 0 || milliseconds > 0;

  let intervalMinutes: number;
  switch (roundTo) {
    case '10_MINUTES':
      intervalMinutes = 10;
      break;
    case '15_MINUTES':
      intervalMinutes = 15;
      break;
    case '30_MINUTES':
      intervalMinutes = 30;
      break;
    case '1_HOUR':
      intervalMinutes = 60;
      break;
    default:
      return new Date(date);
  }

  // Calculate the number of intervals from the hour
  const intervalsFromHour = Math.floor(minutes / intervalMinutes);

  // Calculate the target minutes (round up if needed)
  let targetMinutes = intervalsFromHour * intervalMinutes;
  if (shouldRoundUp || minutes % intervalMinutes > 0) {
    targetMinutes += intervalMinutes;
  }

  // Handle hour overflow
  if (targetMinutes >= 60) {
    roundedDate.setHours(
      roundedDate.getHours() + Math.floor(targetMinutes / 60),
    );
    targetMinutes = targetMinutes % 60;
  }

  // Set the rounded time
  roundedDate.setMinutes(targetMinutes);
  roundedDate.setSeconds(0);
  roundedDate.setMilliseconds(0);

  return roundedDate;
}
