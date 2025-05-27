import { Timeframe } from 'interfaces';
import { RecurringMode } from '../recurring-mode';
import { IntervalAnchorPoint } from './enums';
import { IntervalConfigForm } from './IntervalConfigForm';
import { getDefaultAnchorPoint } from './utils';

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
    if (
      typeof closureDuration !== 'number' ||
      typeof intervalBetweenClosures !== 'number'
    )
      throw new Error('IntervalRecurringMode: Invalid field values');

    let nextClosureStartTime = timeframe.startDate;
    const closureTimeframes: Timeframe[] = [];

    while (true) {
      const nextClosureEndTime = addMinutes(
        nextClosureStartTime,
        closureDuration,
      );
      if (nextClosureEndTime > timeframe.endDate) break;
      closureTimeframes.push({
        startDate: nextClosureStartTime,
        endDate: nextClosureEndTime,
      });

      const targetAnchorPoint = (() => {
        if (anchorPoint !== IntervalAnchorPoint.Default) return anchorPoint;
        return getDefaultAnchorPoint(closureDuration, intervalBetweenClosures);
      })();

      const targetAnchorValue = (() => {
        switch (targetAnchorPoint) {
          case IntervalAnchorPoint.StartOfPreviousClosure:
            return nextClosureStartTime;
          case IntervalAnchorPoint.EndOfPreviousClosure:
            return nextClosureEndTime;
          default:
            return nextClosureEndTime;
        }
      })();

      nextClosureStartTime = addMinutes(
        targetAnchorValue,
        intervalBetweenClosures,
      );
    }

    return {
      timeframes: closureTimeframes,
    };
  },
};

function addMinutes(date: Date, minutes: number): Date {
  const target = new Date(date);
  target.setMinutes(target.getMinutes() + minutes);
  return target;
}
