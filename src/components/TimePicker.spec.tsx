import { render } from '@testing-library/react';
import { TimePicker } from './TimePicker';
import { TimeOnly } from '../classes/time-only';

// Mock jQuery and timepicker
const mockTimepicker = {
  getTime: jest.fn(),
  setTime: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockJQueryInput = {
  timepicker: jest.fn(),
  data: jest.fn(() => mockTimepicker),
  on: jest.fn(),
  off: jest.fn(),
};

const mockJQuery = jest.fn(() => mockJQueryInput);

// Add jQuery to global scope
(global as typeof globalThis & { $: typeof mockJQuery }).$ = mockJQuery;

describe('TimePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockJQueryInput.timepicker.mockReturnValue(mockJQueryInput);
  });

  describe('with TimeOnly values', () => {
    it('should accept a TimeOnly value and convert it to string for internal input', () => {
      const timeOnly = new TimeOnly(14, 30, 0, 0); // 2:30 PM
      const { container } = render(<TimePicker value={timeOnly} />);

      const input = container.querySelector(
        'wz-text-input',
      ) as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.getAttribute('value')).toBe('14:30');
    });

    it('should handle undefined value', () => {
      const { container } = render(<TimePicker value={undefined} />);

      const input = container.querySelector(
        'wz-text-input',
      ) as HTMLInputElement;
      expect(input.getAttribute('value')).toBe('');
    });

    it('should call onChange with TimeOnly when timepicker changes', () => {
      const onChange = jest.fn();
      mockTimepicker.getTime.mockReturnValue('15:45');

      render(<TimePicker onChange={onChange} />);

      // Simulate the timepicker changeTime event
      const onChangeCall = mockJQueryInput.on.mock.calls.find(
        (call) => call[0] === 'changeTime.timepicker',
      );
      expect(onChangeCall).toBeTruthy();

      // Execute the onChange handler
      onChangeCall[1]();

      expect(onChange).toHaveBeenCalledWith(expect.any(TimeOnly));
      const timeOnlyArg = onChange.mock.calls[0][0];
      expect(timeOnlyArg.getHours()).toBe(15);
      expect(timeOnlyArg.getMinutes()).toBe(45);
    });

    it('should call onBlur with TimeOnly when input blurs', () => {
      const onBlur = jest.fn();
      mockTimepicker.getTime.mockReturnValue('09:15');

      render(<TimePicker onBlur={onBlur} />);

      // Simulate the timepicker blur event
      const onBlurCall = mockJQueryInput.on.mock.calls.find(
        (call) => call[0] === 'blur.timepicker',
      );
      expect(onBlurCall).toBeTruthy();

      // Execute the onBlur handler
      onBlurCall[1]();

      expect(onBlur).toHaveBeenCalledWith(expect.any(TimeOnly));
      const timeOnlyArg = onBlur.mock.calls[0][0];
      expect(timeOnlyArg.getHours()).toBe(9);
      expect(timeOnlyArg.getMinutes()).toBe(15);
    });

    it('should not call onChange when timepicker returns null/undefined', () => {
      const onChange = jest.fn();
      mockTimepicker.getTime.mockReturnValue(null);

      render(<TimePicker onChange={onChange} />);

      // Simulate the timepicker changeTime event
      const onChangeCall = mockJQueryInput.on.mock.calls.find(
        (call) => call[0] === 'changeTime.timepicker',
      );
      onChangeCall[1]();

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should handle invalid time strings gracefully', () => {
      const onChange = jest.fn();
      mockTimepicker.getTime.mockReturnValue('invalid-time');

      render(<TimePicker onChange={onChange} />);

      // Simulate the timepicker changeTime event
      const onChangeCall = mockJQueryInput.on.mock.calls.find(
        (call) => call[0] === 'changeTime.timepicker',
      );

      // This should not throw an error
      expect(() => onChangeCall[1]()).not.toThrow();

      // onChange should not be called for invalid times
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
