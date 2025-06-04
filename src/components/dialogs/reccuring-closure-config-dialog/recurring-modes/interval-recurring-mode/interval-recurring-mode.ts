import { Timeframe } from 'interfaces';
import Logger from 'js-logger';
import { RecurringMode } from '../recurring-mode';
import { IntervalAnchorPoint } from './enums';
import { IntervalConfigForm } from './IntervalConfigForm';
import { getDefaultAnchorPoint } from './utils';

const logger = Logger.get('INTERVAL_RECURRING_MODE');

export interface IntervalModeFields {
  /** The length of each closure in minutes */
  closureDuration: number;

  /** The interval between closures in minutes */
  intervalBetweenClosures: number;

  /** The anchor point for the next closure */
  anchorPoint?: IntervalAnchorPoint;
}
export const IntervalRecurringMode: RecurringMode<IntervalModeFields> = {
  id: 'INTERVAL',
  name: 'Interval-Based',
  formComponent: IntervalConfigForm,
  calculateClosureTimes: ({
    timeframe,
    fieldsValues: {
      closureDuration,
      intervalBetweenClosures,
      anchorPoint = IntervalAnchorPoint.Default,
    },
  }) => {
    logger.debug('Calculating interval-based closure times with parameters', {
      timeframe: {
        startDate: timeframe.startDate.toISOString(),
        endDate: timeframe.endDate.toISOString(),
      },
      closureDuration,
      intervalBetweenClosures,
      anchorPoint,
    });

    if (
      typeof closureDuration !== 'number' ||
      typeof intervalBetweenClosures !== 'number'
    ) {
      logger.error('Invalid field values', {
        closureDuration,
        intervalBetweenClosures,
      });
      throw new Error('IntervalRecurringMode: Invalid field values');
    }

    let nextClosureStartTime = timeframe.startDate;
    logger.debug('Initial closure start time', {
      nextClosureStartTime: nextClosureStartTime.toISOString(),
    });

    const closureTimeframes: Timeframe[] = [];

    let iterationCount = 0;
    while (true) {
      iterationCount++;
      logger.debug(`Processing iteration ${iterationCount}`);

      const nextClosureEndTime = addMinutes(
        nextClosureStartTime,
        closureDuration,
      );
      logger.debug('Calculated next closure end time', {
        nextClosureEndTime: nextClosureEndTime.toISOString(),
        closureDuration,
      });

      if (nextClosureEndTime > timeframe.endDate) {
        logger.debug('End time exceeds overall timeframe end, breaking loop', {
          nextClosureEndTime: nextClosureEndTime.toISOString(),
          overallEndTime: timeframe.endDate.toISOString(),
        });
        break;
      }

      logger.debug('Adding timeframe to results', {
        startDate: nextClosureStartTime.toISOString(),
        endDate: nextClosureEndTime.toISOString(),
      });
      closureTimeframes.push({
        startDate: nextClosureStartTime,
        endDate: nextClosureEndTime,
      });

      const targetAnchorPoint = (() => {
        if (anchorPoint !== IntervalAnchorPoint.Default) return anchorPoint;
        const calculatedAnchorPoint = getDefaultAnchorPoint(
          closureDuration,
          intervalBetweenClosures,
        );
        logger.debug('Using default anchor point calculation', {
          closureDuration,
          intervalBetweenClosures,
          calculatedAnchorPoint,
        });
        return calculatedAnchorPoint;
      })();
      logger.debug('Using target anchor point', { targetAnchorPoint });

      const targetAnchorValue = (() => {
        switch (targetAnchorPoint) {
          case IntervalAnchorPoint.StartOfPreviousClosure:
            logger.debug('Using start of previous closure as anchor', {
              anchorValue: nextClosureStartTime.toISOString(),
            });
            return nextClosureStartTime;
          case IntervalAnchorPoint.EndOfPreviousClosure:
            logger.debug('Using end of previous closure as anchor', {
              anchorValue: nextClosureEndTime.toISOString(),
            });
            return nextClosureEndTime;
          default:
            logger.error('Unexpected anchor point', { targetAnchorPoint });
            throw new Error(`Unexpected anchor point: ${targetAnchorPoint}`);
        }
      })();

      nextClosureStartTime = addMinutes(
        targetAnchorValue,
        intervalBetweenClosures,
      );
      logger.debug('Calculated next closure start time', {
        nextClosureStartTime: nextClosureStartTime.toISOString(),
        intervalBetweenClosures,
      });
    }

    logger.debug('Returning interval-based timeframes', {
      count: closureTimeframes.length,
      timeframes: closureTimeframes.map((tf) => ({
        startDate: tf.startDate.toISOString(),
        endDate: tf.endDate.toISOString(),
      })),
    });

    return {
      timeframes: closureTimeframes,
    };
  },
};

function addMinutes(date: Date, minutes: number): Date {
  logger.debug('Adding minutes to date', {
    date: date.toISOString(),
    minutes,
  });

  const target = new Date(date);
  target.setMinutes(target.getMinutes() + minutes);

  logger.debug('Result after adding minutes', {
    result: target.toISOString(),
  });

  return target;
}
