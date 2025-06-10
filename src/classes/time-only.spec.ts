import { TimeOnly } from './time-only';

describe('TimeOnly', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 4, 12, 18, 44, 20, 412));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('Constructor', () => {
    it('should create a TimeOnly instance with the current time when no arguments are provided', () => {
      const timeOnly = new TimeOnly();
      expect(timeOnly.getHours()).toBe(18);
      expect(timeOnly.getMinutes()).toBe(44);
      expect(timeOnly.getSeconds()).toBe(20);
      expect(timeOnly.getMilliseconds()).toBe(412);
    });

    it('should create a TimeOnly instance from a Date object', () => {
      const date = new Date(2025, 4, 12, 10, 30, 15);
      const timeOnly = new TimeOnly(date);
      expect(timeOnly.getHours()).toBe(10);
      expect(timeOnly.getMinutes()).toBe(30);
      expect(timeOnly.getSeconds()).toBe(15);
      expect(timeOnly.getMilliseconds()).toBe(0);
    });

    it('should create a TimeOnly instance from a time string', () => {
      const timeOnly = new TimeOnly('12:45:30');
      expect(timeOnly.getHours()).toBe(12);
      expect(timeOnly.getMinutes()).toBe(45);
      expect(timeOnly.getSeconds()).toBe(30);
      expect(timeOnly.getMilliseconds()).toBe(0);
    });

    it('should create a TimeOnly instance from hours, minutes, seconds, and milliseconds', () => {
      const timeOnly = new TimeOnly(14, 20, 45, 500);
      expect(timeOnly.getHours()).toBe(14);
      expect(timeOnly.getMinutes()).toBe(20);
      expect(timeOnly.getSeconds()).toBe(45);
      expect(timeOnly.getMilliseconds()).toBe(500);
    });

    it('should throw an error for invalid single argument types', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => new TimeOnly(123 as any)).toThrow(
        'Creating a TimeOnly instance with 1 argument requires it to be either a Date or a Time String',
      );
    });

    it('should throw an error for invalid time string formats', () => {
      expect(() => new TimeOnly('invalid')).toThrow(
        'Creating TimeOnly from a String requires at least specifying hours and minutes in HH:MM format, and accepts at max 4 components (hours, minutes, seconds, milliseconds)',
      );
    });
  });

  describe('Methods', () => {
    let timeOnly: TimeOnly;

    beforeEach(() => {
      timeOnly = new TimeOnly(10, 15, 30, 500);
    });

    it('toString should return the correct time string', () => {
      const result = timeOnly.toString();
      expect(typeof result).toBe('string');
      expect(result.startsWith('10:15:30')).toBe(true);
    });

    it('getHours should return the correct hours', () => {
      expect(timeOnly.getHours()).toBe(10);
    });

    it('setHours should update the hours correctly', () => {
      timeOnly.setHours(12);
      expect(timeOnly.getHours()).toBe(12);
    });

    it('getMinutes should return the correct minutes', () => {
      expect(timeOnly.getMinutes()).toBe(15);
    });

    it('setMinutes should update the minutes correctly', () => {
      timeOnly.setMinutes(45);
      expect(timeOnly.getMinutes()).toBe(45);
    });

    it('getSeconds should return the correct seconds', () => {
      expect(timeOnly.getSeconds()).toBe(30);
    });

    it('setSeconds should update the seconds correctly', () => {
      timeOnly.setSeconds(50);
      expect(timeOnly.getSeconds()).toBe(50);
    });

    it('getMilliseconds should return the correct milliseconds', () => {
      expect(timeOnly.getMilliseconds()).toBe(500);
    });

    it('setMilliseconds should update the milliseconds correctly', () => {
      timeOnly.setMilliseconds(250);
      expect(timeOnly.getMilliseconds()).toBe(250);
    });
  });
});
