import { useEffect, useRef, ComponentProps } from 'react';
import { useMergeRefs } from '../hooks/useMergeRefs';
import { TimeOnly } from '../classes/time-only';

// Helper function to format TimeOnly to HH:MM format
const formatTimeOnlyToString = (timeOnly: TimeOnly): string => {
  const hours = timeOnly.getHours().toString().padStart(2, '0');
  const minutes = timeOnly.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper function to safely create TimeOnly from string
const createTimeOnlyFromString = (timeString: string): TimeOnly | null => {
  try {
    if (!timeString || typeof timeString !== 'string') {
      return null;
    }
    return new TimeOnly(timeString);
  } catch {
    return null;
  }
};

interface TimePickerProps extends ComponentProps<'wz-text-input'> {
  value?: TimeOnly;
  onChange?: (value: TimeOnly) => void;
  onBlur?: (value: TimeOnly) => void;
  timePickerOptions?: {
    defaultTime?: boolean | string;
    showMeridian?: boolean;
    template?: boolean | string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export const TimePicker = ({
  value,
  onChange,
  onBlur,
  timePickerOptions = {},
  ref,
  ...props
}: TimePickerProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Combine the external ref with our internal ref using useMergeRefs
  const mergedRef = useMergeRefs(inputRef, ref);

  // Convert TimeOnly to string for the input value
  const stringValue = value ? formatTimeOnlyToString(value) : '';

  // Initialize timepicker when the component mounts
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const jQueryInput = $(input) as JQuery<HTMLInputElement> & {
      timepicker(options: object): void;
    };

    // Default options
    const defaultOptions = {
      defaultTime: false,
      showMeridian: false,
      template: false,
    };

    // Initialize timepicker with merged options
    jQueryInput.timepicker({
      ...defaultOptions,
      ...timePickerOptions,
    });

    const timePicker = jQueryInput.data('timepicker');

    // Set up event listeners for timepicker events
    jQueryInput.on('changeTime.timepicker', () => {
      const timeValue = timePicker.getTime();
      if (timeValue && onChange) {
        const timeOnly = createTimeOnlyFromString(timeValue);
        if (timeOnly) {
          onChange(timeOnly);
        }
      }
    });

    jQueryInput.on('blur.timepicker', () => {
      timePicker.setTime(input.value, true);
      timePicker.update();
      const timeValue = timePicker.getTime();
      if (timeValue && onBlur) {
        const timeOnly = createTimeOnlyFromString(timeValue);
        if (timeOnly) {
          onBlur(timeOnly);
        }
      }
    });

    // Clean up event listeners when component unmounts
    return () => {
      jQueryInput.off('changeTime.timepicker blur.timepicker');
      timePicker.remove();
    };
  }, [onChange, onBlur, timePickerOptions]);

  return (
    <wz-text-input
      ref={mergedRef}
      value={stringValue}
      autocomplete="off"
      {...props}
    />
  );
};
