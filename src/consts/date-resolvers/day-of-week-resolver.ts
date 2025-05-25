import { Weekday } from 'enums';
import { createDateResolver } from './date-resolver';
import { DateOnly } from 'classes';

interface DayOfWeekResolverArgs {
  /** The numeric representation of the day(s) of the week, to be used with the {@link WeekdayFlags} bitwise enum. */
  dayOfWeek: number;
}

function validateDayOfWeek(dayOfWeek: Weekday): boolean {
  return Object.values(Weekday).includes(dayOfWeek);
}

function validateArguments(args: DayOfWeekResolverArgs): boolean {
  return args.dayOfWeek != null && validateDayOfWeek(args.dayOfWeek);
}

/**
 * Resolves a specific day of the week relative to the current date.
 *
 * Usage:
 * Pass an object with a `dayOfWeek` property (of type `Weekday`) to determine
 * the next occurrence of that day of the week.
 * Throws an error if the arguments are invalid.
 */
export const DAY_OF_WEEK_RESOLVER = createDateResolver(
  'SPECIFIC_DAY_OF_WEEK',
  (args: DayOfWeekResolverArgs) => {
    if (!validateArguments(args)) {
      throw new Error(
        `Invalid arguments for DAY_OF_WEEK_RESOLVER: dayOfWeek=${args.dayOfWeek}`,
      );
    }

    const { dayOfWeek } = args;
    const today = new Date();
    const todayDayOfWeek = today.getUTCDay();
    const daysUntilNextOccurrence = (dayOfWeek + 7 - todayDayOfWeek) % 7 || 7; // If it's today, go to next week
    const nextOccurrence = new DateOnly(today);
    nextOccurrence.setUTCDate(today.getUTCDate() + daysUntilNextOccurrence);
    return nextOccurrence;
  },
);
