import { render } from '@testing-library/react';
import { TimePicker } from './TimePicker';
import { TimeOnly } from '../classes/time-only';

// Mock jQuery completely to avoid initialization
const mockJQuery = jest.fn(() => ({
  timepicker: jest.fn(),
  data: jest.fn(() => ({
    getTime: jest.fn(),
    setTime: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  })),
  on: jest.fn(),
  off: jest.fn(),
}));

// Mock jQuery global
(global as any).$ = mockJQuery;

describe('TimePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with TimeOnly value formatted as HH:MM', () => {
    const timeValue = new TimeOnly(14, 30, 0, 0);

    const { container } = render(<TimePicker value={timeValue} />);

    const input = container.querySelector('wz-text-input');
    expect(input).toBeDefined();
    expect(input?.getAttribute('value')).toBe('14:30');
  });

  it('should render with empty value when TimeOnly is undefined', () => {
    const { container } = render(<TimePicker />);

    const input = container.querySelector('wz-text-input');
    expect(input).toBeDefined();
    expect(input?.getAttribute('value')).toBe('');
  });

  it('should format TimeOnly with leading zeros', () => {
    const timeValue = new TimeOnly(9, 5, 0, 0);

    const { container } = render(<TimePicker value={timeValue} />);

    const input = container.querySelector('wz-text-input');
    expect(input).toBeDefined();
    expect(input?.getAttribute('value')).toBe('09:05');
  });
});
