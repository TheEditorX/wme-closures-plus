import { useEffect, useRef, ComponentProps } from 'react';
import { useMergeRefs } from '../hooks/useMergeRefs';

interface TimePickerProps extends ComponentProps<'wz-text-input'> {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  timePickerOptions?: {
    defaultTime?: boolean | string;
    showMeridian?: boolean;
    template?: boolean | string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export const TimePicker = ({
  value = '',
  onChange,
  onBlur,
  timePickerOptions = {},
  ref,
  ...props
}: TimePickerProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Combine the external ref with our internal ref using useMergeRefs
  const mergedRef = useMergeRefs(inputRef, ref);

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
        onChange(timeValue);
      }
    });

    jQueryInput.on('blur.timepicker', () => {
      timePicker.setTime(input.value, true);
      timePicker.update();
      onBlur?.(timePicker.getTime());
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
      value={value}
      autocomplete="off"
      {...props}
    />
  );
};
