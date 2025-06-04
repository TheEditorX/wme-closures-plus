import { WeekdayFlags } from 'enums';
import Logger from 'js-logger';
import { createDateResolver } from './date-resolver';
import { DateOnly } from 'classes';

const logger = Logger.get('DAY_OF_WEEK_RESOLVER');

interface DayOfWeekResolverArgs {
  /** The numeric representation of the day(s) of the week, to be used with the {@link WeekdayFlags} bitwise enum. */
  dayOfWeek: number;
}

function dayFlagToDayIndex(dayFlag: number): number {
  // days are sorted from Sunday to Saturday by bit-position
  // Sunday being the first bit (00000001), Saturday being the last (01000000)

  // we need to calculate the index of the first set bit
  for (let i = 0; i < 7; i++) {
    if (dayFlag & (1 << i)) {
      return i; // Return the index of the first set bit
    }
  }

  return -1; // No bits are set, return -1
}

function validateArguments(args: DayOfWeekResolverArgs): boolean {
  return args.dayOfWeek != null;
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
    const flags = new WeekdayFlags(dayOfWeek);

    logger.debug('Resolving to date using args', { dayOfWeek });

    const basicFlagValues = flags.getActiveBasicFlags();
    logger.debug('Extracted active basic flags', { value: basicFlagValues });
    const nextOccurrences = basicFlagValues.map((dayFlagValue) => {
      const dayIndex = dayFlagToDayIndex(dayFlagValue);
      const today = new Date();
      const todayDayOfWeek = today.getUTCDay();
      const daysUntilNextOccurrence = (dayIndex + 7 - todayDayOfWeek) % 7 || 7; // If it's today, go to next week
      const nextOccurrence = new DateOnly(today);
      nextOccurrence.setUTCDate(today.getUTCDate() + daysUntilNextOccurrence);
      logger.debug('Calculating for day index', {
        dayIndex,
        dayFlagValue,
        today: today.toISOString(),
        todayDayOfWeek,
        daysUntilNextOccurrence,
        nextOccurrence: nextOccurrence.toISOString(),
      });
      return nextOccurrence;
    });

    if (nextOccurrences.length === 0) {
      throw new Error(
        `No valid days of the week found in the provided dayOfWeek: ${dayOfWeek}`,
      );
    }

    // Return the earliest next occurrence
    return nextOccurrences.reduce((earliest, current) => {
      return earliest < current ? earliest : current;
    }, nextOccurrences[0]);
  },
);
