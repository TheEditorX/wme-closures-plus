import { IntervalAnchorPoint } from '../enums';

export function getDefaultAnchorPoint(
  closureDuration: number,
  intervalBetweenClosures: number,
): IntervalAnchorPoint {
  /*
   Default anchor point logic explanation:
   -  If the closure length is longer than or equal to the interval, using the start of the previous closure
      will result in overlapping closures. In this case, we use the end of the previous closure.
   -  If the closure length is shorter than the interval, we can safely use the start of the previous closure.
   */

  if (closureDuration >= intervalBetweenClosures)
    return IntervalAnchorPoint.EndOfPreviousClosure;

  return IntervalAnchorPoint.StartOfPreviousClosure;
}
