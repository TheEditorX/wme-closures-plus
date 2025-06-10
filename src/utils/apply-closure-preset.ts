import { ClosureEditorForm, DateOnly } from 'classes';
import { TimeOnly } from 'classes';
import { getDateResolverByName } from 'consts/date-resolvers';
import { ClosurePreset } from 'interfaces/closure-preset';
import Logger from 'js-logger';

const logger = Logger.get('closure-presets');

function getStartDateForPreset(
  closureDetails: ClosurePreset['closureDetails'],
  defaultStartDate: DateOnly = new DateOnly(),
): Date {
  logger.debug('Getting start timestamp for preset');

  const date = ((): DateOnly => {
    if (!closureDetails.startDate) {
      logger.debug('No specific start date supplied. Using default', {
        default: defaultStartDate.toISOString(),
      });
      return defaultStartDate;
    }

    logger.debug('Using date resolver to get start date', {
      resolver: closureDetails.startDate.type,
    });
    const result = getDateResolverByName(closureDetails.startDate.type).resolve(
      closureDetails.startDate.args,
    );
    logger.debug('Resolved start date', {
      resolver: closureDetails.startDate.type,
      result: result.toISOString(),
    });
    return result;
  })();

  const time = ((): TimeOnly => {
    if (!closureDetails.startTime) {
      logger.debug('No specific start time supplied. Using current time');
      return new TimeOnly();
    }

    logger.debug('Using specified time as start time', {
      hours: closureDetails.startTime.hours,
      minutes: closureDetails.startTime.minutes,
    });
    return new TimeOnly(
      closureDetails.startTime.hours,
      closureDetails.startTime.minutes,
      0,
      0,
    );
  })();

  const result = date.withTime(time);
  logger.debug('Resolved starting timestamp', {
    value: result.toISOString(),
  });
  return result;
}

function getEndDateForPreset(
  closureDetails: ClosurePreset['closureDetails'],
  startDate: Date,
): Date {
  const { end: endDetails } = closureDetails;

  logger.debug('Getting end timestamp for preset', {
    value: endDetails,
  });

  switch (endDetails.type) {
    case 'DURATIONAL': {
      const endDate = new Date(
        startDate.getTime() +
          (endDetails.duration.hours * 3600 +
            endDetails.duration.minutes * 60) *
            1000,
      );

      if (endDetails.roundUpTo) {
        logger.debug(
          `Rounding up the end time to the nearest ${endDetails.roundUpTo} minutes`,
        );
        const minutes = endDate.getMinutes();
        const roundUpToMinutes = endDetails.roundUpTo;
        const remainder = minutes % roundUpToMinutes;

        if (remainder > 0) {
          // Round up to the next interval
          const minutesToAdd = roundUpToMinutes - remainder;
          endDate.setMinutes(minutes + minutesToAdd);
          // Reset seconds and milliseconds
          endDate.setSeconds(0, 0);
        }
      }

      return endDate;
    }
    case 'FIXED': {
      const startTime = new TimeOnly(startDate);
      const endTime = new TimeOnly(
        endDetails.time.hours,
        endDetails.time.minutes,
        0,
        0,
      );
      const endDate = new Date(startDate);
      endDate.setHours(
        endTime.getHours(),
        endTime.getMinutes(),
        endTime.getSeconds(),
        endTime.getMilliseconds(),
      );
      if (endTime < startTime) {
        logger.debug(
          'Using fixed end time. End time is earlier than the start time, probably referring to the next day. Advances the date',
          {
            startTime: startTime.toString(),
            endTime: endTime.toString(),
          },
        );
        // we need to apply the end time to the next day
        endDate.setDate(endDate.getDate() + 1);
      }
      if (endDetails.postponeBy) {
        logger.debug(
          `Postponing the end time by ${endDetails.postponeBy} minutes`,
        );
        const time = endDate.getTime();
        const postponeByMs = endDetails.postponeBy * 60 * 1000;
        endDate.setTime(time + postponeByMs);
      }
      return endDate;
    }
    default:
      throw new Error(
        `Unsupported end type: ${(endDetails as { type: string }).type}`,
      );
  }
}

export function applyClosurePreset(
  { closureDetails, ...restPreset }: ClosurePreset,
  closureEditorForm: ClosureEditorForm,
) {
  logger.debug('Beginning to apply a closure preset', {
    presetMeta: restPreset,
    closureDetails,
  });

  const startDate = getStartDateForPreset(
    closureDetails,
    new DateOnly(closureEditorForm.getStart()),
  );
  const endDate = getEndDateForPreset(closureDetails, startDate);

  if (closureDetails.description) {
    logger.log('Preset has a description. Applying..');
    closureEditorForm.setDescription(closureDetails.description);
  }

  logger.log('Applying resolved start timestamp', {
    value: startDate.toISOString(),
  });
  closureEditorForm.setStart(startDate);
  logger.log('Applying resolved end timestamp', {
    value: endDate.toISOString(),
  });
  closureEditorForm.setEnd(endDate);
}
