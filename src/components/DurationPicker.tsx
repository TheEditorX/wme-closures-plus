import { useDurationInput } from 'hooks/useDurationInput';
import { ComponentProps } from 'react';

interface DurationPickerProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  label?: string;
  value?: number;
  onChange?: (value: number) => void;
}
export function DurationPicker(props: DurationPickerProps) {
  const { inputValue, onChange, onBlur, onKeyDown, error } = useDurationInput({
    modifiers: [
      { modifier: 'd', multiplier: 60 * 24 },
      { modifier: 'h', multiplier: 60 },
      { modifier: 'm', multiplier: 1 },
    ],
    value: props.value,
    onChange: props.onChange,
  });

  return (
    <wz-text-input
      {...props}
      ref={props.ref}
      value={inputValue}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      errorMessage={
        error ?
          {
            INVALID_PATTERN: '* Invalid format',
          }[error]
        : null
      }
      autocomplete="off"
    />
  );
}
