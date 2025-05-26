import { expect } from '@jest/globals';
import '../../../tests/__extenders__/toBeDateEqual';
import { DAY_OF_WEEK_RESOLVER } from './day-of-week-resolver';
import { WeekdayFlags } from '../../enums';

describe('DAY_OF_WEEK_RESOLVER', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-04-17T13:00:00Z')); // Set a fixed date for testing
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve the next occurrence of the specified day of the week', () => {
    const result = DAY_OF_WEEK_RESOLVER.resolve({
      dayOfWeek: WeekdayFlags.Tuesday.valueOf(),
    });

    expect(result.toDate()).toBeDateEqual(new Date('2025-04-22T13:00:00Z')); // Next Tuesday from the fixed date
    expect(result.toDate()).toBeDateEqual(new Date('2025-04-22T05:00:00Z')); // Next Tuesday from the fixed date without time comparison
  });

  it("should return next week today's if the specified day of the week is today", () => {
    const result = DAY_OF_WEEK_RESOLVER.resolve({
      dayOfWeek: WeekdayFlags.Thursday.valueOf(),
    });

    expect(result.toDate()).toBeDateEqual(new Date('2025-04-24T13:00:00Z')); // Next Thursday from the fixed date
    expect(result.toDate()).toBeDateEqual(new Date('2025-04-24T05:00:00Z')); // Next Thursday from the fixed date without time comparison
  });
});
