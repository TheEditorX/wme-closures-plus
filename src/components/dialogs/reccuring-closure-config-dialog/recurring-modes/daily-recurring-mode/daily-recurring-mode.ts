import { Timeframe } from 'interfaces';
import Logger from 'js-logger';
import { RecurringMode } from '../recurring-mode';
import { DailyConfigForm, DailyConfigFormFields } from './DailyConfigForm';

const logger = Logger.get('DAILY_RECURRING_MODE');

export const DailyRecurringMode: RecurringMode<DailyConfigFormFields> = {
  id: 'DAILY',
  name: 'Daily',
  formComponent: DailyConfigForm,
  calculateClosureTimes: ({ fieldsValues, timeframe }) => {
    logger.debug('Calculating closure times with parameters', {
      fieldsValues,
      timeframe: {
        startDate: timeframe.startDate.toISOString(),
        endDate: timeframe.endDate.toISOString(),
      },
    });

    const dailyTimeframes = getDailyTimeframes(timeframe);
    logger.debug('Generated daily timeframes', {
      count: dailyTimeframes.length,
      timeframes: dailyTimeframes.map((tf) => ({
        startDate: tf.startDate.toISOString(),
        endDate: tf.endDate.toISOString(),
      })),
    });

    // return filtered timeframes based on the day of week of start day
    const filteredTimeframes = dailyTimeframes.filter((dailyTimeframe) => {
      const startDayOfWeek = dailyTimeframe.startDate.getDay();
      const isIncluded = fieldsValues.days.includes(startDayOfWeek);
      logger.debug('Filtering timeframe by day of week', {
        startDate: dailyTimeframe.startDate.toISOString(),
        startDayOfWeek,
        isIncluded,
        selectedDays: fieldsValues.days,
      });
      return isIncluded;
    });

    logger.debug('Final filtered timeframes', {
      count: filteredTimeframes.length,
      timeframes: filteredTimeframes.map((tf) => ({
        startDate: tf.startDate.toISOString(),
        endDate: tf.endDate.toISOString(),
      })),
    });

    return {
      timeframes: filteredTimeframes,
    };
  },
};

function getDailyTimeframes(timeframe: Timeframe): Timeframe[] {
  logger.debug('Getting daily timeframes for', {
    startDate: timeframe.startDate.toISOString(),
    endDate: timeframe.endDate.toISOString(),
  });

  const results: Timeframe[] = [];

  // Ensure endDate is strictly after startDate
  if (timeframe.endDate <= timeframe.startDate) {
    // Allow zero-duration if needed, otherwise return empty
    logger.warn('Timeframe has zero or negative duration', {
      startDate: timeframe.startDate.toISOString(),
      endDate: timeframe.endDate.toISOString(),
    });
    return results;
  }

  const overallStart = timeframe.startDate;
  const overallEnd = timeframe.endDate;
  const isOvernight = isOvernightTimeframe(timeframe);

  logger.debug('Timeframe overnight status', { isOvernight });

  // Initialize loop date to the beginning of the overall start date's day
  const currentDayStart = new Date(overallStart);
  currentDayStart.setHours(0, 0, 0, 0);

  logger.debug('Initialized current day start', {
    currentDayStart: currentDayStart.toISOString(),
  });

  // --- Loop Through Days ---
  while (currentDayStart < overallEnd) {
    // Continue as long as the start of the current day is before the overall end time
    logger.debug('Processing day', {
      currentDayStart: currentDayStart.toISOString(),
      overallEnd: overallEnd.toISOString(),
    });

    // Ideal start for this day is current day date + overallStart time
    const idealStart = new Date(currentDayStart);
    idealStart.setHours(
      overallStart.getHours(),
      overallStart.getMinutes(),
      overallStart.getSeconds(),
      overallStart.getMilliseconds(),
    );

    // Ideal end for this day is *next* day date + overallEnd time
    const idealEnd = new Date(currentDayStart); // Start with current day
    idealEnd.setHours(
      overallEnd.getHours(),
      overallEnd.getMinutes(),
      overallEnd.getSeconds(),
      overallEnd.getMilliseconds(),
    );
    if (isOvernight) idealEnd.setDate(idealEnd.getDate() + 1); // Move date to next day

    logger.debug('Calculated ideal times', {
      idealStart: idealStart.toISOString(),
      idealEnd: idealEnd.toISOString(),
      isOvernight,
    });

    const segmentStart = new Date(
      Math.max(idealStart.getTime(), overallStart.getTime()),
    );
    const segmentEnd = new Date(
      Math.min(idealEnd.getTime(), overallEnd.getTime()),
    );

    logger.debug('Calculated segment times', {
      segmentStart: segmentStart.toISOString(),
      segmentEnd: segmentEnd.toISOString(),
    });

    // Add the calculated segment only if it's valid (start < end)
    // This check handles cases where clamping might invert or zero the duration.
    if (segmentStart < segmentEnd) {
      logger.debug('Adding valid segment to results');
      results.push({ startDate: segmentStart, endDate: segmentEnd });
    } else {
      logger.debug('Skipping invalid segment (start >= end)');
    }

    // Move to the next day for the next iteration
    currentDayStart.setDate(currentDayStart.getDate() + 1);
    logger.debug('Moving to next day', {
      nextDayStart: currentDayStart.toISOString(),
    });
  }

  logger.debug('Returning daily timeframes', {
    count: results.length,
    timeframes: results.map((tf) => ({
      startDate: tf.startDate.toISOString(),
      endDate: tf.endDate.toISOString(),
    })),
  });
  return results;
}

/**
 * Checks if a timeframe represents an "overnight" period, meaning
 * the time part of the end date is earlier than the time part of the start date.
 * Example: Starts at 10:00 PM, ends at 6:00 AM the next day.
 *
 * @param {object} timeframe An object with startDate and endDate properties.
 * @param {Date} timeframe.startDate The start date and time.
 * @param {Date} timeframe.endDate The end date and time.
 * @returns {boolean} True if the end time is earlier in the day than the start time, false otherwise.
 */
function isOvernightTimeframe(timeframe: Timeframe): boolean {
  logger.debug('Checking if timeframe is overnight', {
    startDate:
      timeframe?.startDate instanceof Date ?
        timeframe.startDate.toISOString()
      : 'invalid',
    endDate:
      timeframe?.endDate instanceof Date ?
        timeframe.endDate.toISOString()
      : 'invalid',
  });

  // Optional: Add input validation
  if (
    !timeframe ||
    !(timeframe.startDate instanceof Date) ||
    !(timeframe.endDate instanceof Date)
  ) {
    // Or throw an error, depending on desired behavior
    logger.error(
      'Invalid input: timeframe object with startDate and endDate (Date objects) required.',
    );
    return false;
  }

  const start = timeframe.startDate;
  const end = timeframe.endDate;

  // Calculate milliseconds past midnight for start time (local time)
  const startMillisSinceMidnight =
    start.getHours() * 3600000 +
    start.getMinutes() * 60000 +
    start.getSeconds() * 1000 +
    start.getMilliseconds();

  // Calculate milliseconds past midnight for end time (local time)
  const endMillisSinceMidnight =
    end.getHours() * 3600000 +
    end.getMinutes() * 60000 +
    end.getSeconds() * 1000 +
    end.getMilliseconds();

  logger.debug('Calculated milliseconds since midnight', {
    startTime: `${start.getHours()}:${start.getMinutes()}:${start.getSeconds()}`,
    endTime: `${end.getHours()}:${end.getMinutes()}:${end.getSeconds()}`,
    startMillisSinceMidnight,
    endMillisSinceMidnight,
  });

  const isOvernight = endMillisSinceMidnight <= startMillisSinceMidnight;
  logger.debug('Overnight calculation result', { isOvernight });

  return isOvernight;
}
