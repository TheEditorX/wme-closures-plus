import { roundTime } from './round-time';

describe('roundTime', () => {
  it('should not round when roundTo is NONE', () => {
    const date = new Date('2023-01-01T10:23:45.678Z');
    const result = roundTime(date, 'NONE');

    expect(result).toEqual(date);
    expect(result).not.toBe(date); // should be a new instance
  });

  it('should round up to nearest 10 minutes when there are seconds', () => {
    const date = new Date('2023-01-01T10:23:30.000Z');
    const result = roundTime(date, '10_MINUTES');

    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('should round up to nearest 10 minutes when there are milliseconds', () => {
    const date = new Date('2023-01-01T10:20:00.500Z');
    const result = roundTime(date, '10_MINUTES');

    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('should not round up exact 10 minute intervals with no seconds/milliseconds', () => {
    const date = new Date('2023-01-01T10:20:00.000Z');
    const result = roundTime(date, '10_MINUTES');

    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(20);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('should round up to nearest 15 minutes', () => {
    const date = new Date('2023-01-01T10:23:00.000Z');
    const result = roundTime(date, '15_MINUTES');

    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('should round up to nearest 30 minutes', () => {
    const date = new Date('2023-01-01T10:23:00.000Z');
    const result = roundTime(date, '30_MINUTES');

    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('should round up to nearest hour', () => {
    const date = new Date('2023-01-01T10:23:00.000Z');
    const result = roundTime(date, '1_HOUR');

    expect(result.getHours()).toBe(11);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('should handle hour overflow correctly', () => {
    const date = new Date('2023-01-01T23:55:30.000Z');
    const result = roundTime(date, '10_MINUTES');

    expect(result.getDate()).toBe(2); // should advance to next day
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('should handle edge case at exact hour boundary', () => {
    const date = new Date('2023-01-01T10:00:00.000Z');
    const result = roundTime(date, '15_MINUTES');

    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('should round up partial minutes within interval', () => {
    const date = new Date('2023-01-01T10:07:00.000Z');
    const result = roundTime(date, '10_MINUTES');

    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(10);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});
