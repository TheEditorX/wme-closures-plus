import { TimeOnly } from '../classes/time-only';
import { formatTimeInput } from './format-time-input';

describe('formatTimeInput', () => {
  it('should format midnight correctly', () => {
    const time = new TimeOnly(0, 0, 0, 0);
    expect(formatTimeInput(time)).toBe('00:00');
  });

  it('should format single digit hours and minutes with padding', () => {
    const time = new TimeOnly(9, 5, 0, 0);
    expect(formatTimeInput(time)).toBe('09:05');
  });

  it('should format noon correctly', () => {
    const time = new TimeOnly(12, 0, 0, 0);
    expect(formatTimeInput(time)).toBe('12:00');
  });

  it('should format double digit hours and minutes correctly', () => {
    const time = new TimeOnly(14, 45, 0, 0);
    expect(formatTimeInput(time)).toBe('14:45');
  });

  it('should format late evening correctly', () => {
    const time = new TimeOnly(23, 59, 0, 0);
    expect(formatTimeInput(time)).toBe('23:59');
  });
});
