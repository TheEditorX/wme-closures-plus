import { DateOnly } from './date-only';
import { TimeOnly } from './time-only';

describe('DateOnly', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 0, 1, 18, 41, 0, 0)); // Set a fixed date for testing
  });

  it('should create an instance with the current date when no arguments are provided', () => {
    const dateOnly = new DateOnly();
    const now = new Date();
    expect(dateOnly.getDate()).toBe(now.getDate());
    expect(dateOnly.getMonth()).toBe(now.getMonth());
    expect(dateOnly.getFullYear()).toBe(now.getFullYear());
    expect(dateOnly.getDay()).toBe(now.getDay());
    expect(dateOnly.toISOString()).toBe(now.toISOString().split('T')[0]);
  });

  it('should create an instance with a specific Date object', () => {
    const date = new Date(2023, 1, 21, 13, 44, 0, 0);
    const dateOnly = new DateOnly(date);
    expect(dateOnly.getDate()).toBe(date.getDate());
    expect(dateOnly.getMonth()).toBe(date.getMonth());
    expect(dateOnly.getFullYear()).toBe(date.getFullYear());
    expect(dateOnly.getDay()).toBe(date.getDay());
    expect(dateOnly.toISOString()).toBe('2023-02-21');
  });

  it('should create an instance with a specific timestamp', () => {
    const timestamp = new Date(2023, 0, 1).getTime();
    const dateOnly = new DateOnly(timestamp);
    expect(dateOnly.getDate()).toBe(1);
    expect(dateOnly.getMonth()).toBe(0);
    expect(dateOnly.getFullYear()).toBe(2023);
    expect(dateOnly.getDay()).toBe(0);
    expect(dateOnly.toISOString()).toBe('2023-01-01');
  });

  it('should create an instance with a specific date string', () => {
    const dateOnly = new DateOnly('2023-01-01');
    expect(dateOnly.toISOString()).toBe('2023-01-01');
  });

  it('should create an instance with year, month, and date', () => {
    const dateOnly = new DateOnly(2023, 0, 1);
    expect(dateOnly.toISOString()).toBe('2023-01-01');
  });

  it('should return the correct string representation', () => {
    const dateOnly = new DateOnly('2023-01-01');
    expect(dateOnly.toString()).toBe('Sun Jan 01 2023');
  });

  it('should return the correct ISO string', () => {
    const dateOnly = new DateOnly('2023-01-01');
    expect(dateOnly.toISOString()).toBe('2023-01-01');
  });

  it('should return the correct JSON representation', () => {
    const dateOnly = new DateOnly('2023-01-01');
    expect(dateOnly.toJSON()).toBe('2023-01-01');
  });

  it('should return the correct local date components', () => {
    const dateOnly = new DateOnly('2023-01-01');
    expect(dateOnly.getDate()).toBe(1);
    expect(dateOnly.getMonth()).toBe(0);
    expect(dateOnly.getFullYear()).toBe(2023);
    expect(dateOnly.getDay()).toBe(0);
  });

  it('should set and return the correct local date components', () => {
    const dateOnly = new DateOnly('2023-01-01');
    dateOnly.setDate(2);
    expect(dateOnly.getDate()).toBe(2);

    dateOnly.setMonth(1);
    expect(dateOnly.getMonth()).toBe(1);

    dateOnly.setFullYear(2024);
    expect(dateOnly.getFullYear()).toBe(2024);
  });

  it('should return the correct time in milliseconds since the Unix epoch', () => {
    const dateOnly = new DateOnly('2023-01-01');
    expect(dateOnly.getTime()).toBe(Date.UTC(2023, 0, 1));
  });

  it('should return a new Date object with the correct value', () => {
    const dateOnly = new DateOnly('2023-01-01');
    const date = dateOnly.toDate();
    expect(date.getTime()).toBe(new Date(2023, 0, 1).getTime());
  });

  it('should compare two DateOnly instances correctly', () => {
    const date1 = new DateOnly('2023-01-01');
    const date2 = new DateOnly('2023-01-01');
    const date3 = new DateOnly('2023-01-02');
    const date4 = new DateOnly(Date.now());

    expect(date1.getTime()).toBe(date2.getTime());
    expect(date1.getTime()).not.toBe(date3.getTime());
    expect(date1.getTime()).toBe(date4.getTime());
  });

  describe('DateOnly.withTime', () => {
    it('should return a new Date object with the correct time set', () => {
      const dateOnly = new DateOnly('2023-01-01');
      const timeOnly = new TimeOnly(12, 30, 45, 500); // 12:30:45.500

      const result = dateOnly.withTime(timeOnly);

      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
      expect(result.getMilliseconds()).toBe(500);
    });

    it('should handle midnight time correctly', () => {
      const dateOnly = new DateOnly('2023-01-01');
      const timeOnly = new TimeOnly(0, 0, 0, 0); // Midnight

      const result = dateOnly.withTime(timeOnly);

      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should handle edge case times correctly', () => {
      const dateOnly = new DateOnly('2023-01-01');
      const timeOnly = new TimeOnly(23, 59, 59, 999); // 23:59:59.999

      const result = dateOnly.withTime(timeOnly);

      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });
});
