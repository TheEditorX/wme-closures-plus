import { useEffect, useRef, ComponentProps } from 'react';
import { useMergeRefs } from '../hooks/useMergeRefs';
import { TimeOnly } from '../classes/time-only';

interface TimePickerProps extends ComponentProps<'wz-text-input'> {
  value?: TimeOnly;
  onChange?: (value: TimeOnly | undefined) => void;
  onBlur?: (value: TimeOnly | undefined) => void;
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

  // Convert TimeOnly to string for display
  const displayValue = value ? value.formatAsTimeInput() : '';

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
        try {
          const timeOnly = new TimeOnly(timeValue);
          onChange(timeOnly);
        } catch {
          // If the time string is invalid, call onChange with undefined
          onChange(undefined);
        }
      } else {
        onChange?.(undefined);
      }
    });

    jQueryInput.on('blur.timepicker', () => {
      timePicker.setTime(input.value, true);
      timePicker.update();
      const timeValue = timePicker.getTime();
      if (timeValue && onBlur) {
        try {
          const timeOnly = new TimeOnly(timeValue);
          onBlur(timeOnly);
        } catch {
          // If the time string is invalid, call onBlur with undefined
          onBlur(undefined);
        }
      } else {
        onBlur?.(undefined);
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
      value={displayValue}
      autocomplete="off"
      {...props}
    />
  );
};
