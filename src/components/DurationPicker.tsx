import { useDurationInput } from 'hooks/useDurationInput';
import { ComponentProps } from 'react';
import { useTranslation } from '../hooks';

interface DurationPickerProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  label?: string;
  value?: number;
  onChange?: (value: number) => void;
}
export function DurationPicker(props: DurationPickerProps) {
  const { t } = useTranslation();

  const { inputValue, onChange, onBlur, onKeyDown, error } = useDurationInput({
    modifiers: [
      { modifier: 'w', multiplier: 60 * 24 * 7 },
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
      errorMessage={error ? t('duration_picker.errors')[error] : null}
      autocomplete="off"
    >
      <div slot="trailing-icon">
        <wz-basic-tooltip>
          <wz-tooltip-source>
            <i className="w-icon w-icon-info"></i>
          </wz-tooltip-source>
          <wz-tooltip-target></wz-tooltip-target>
          <wz-tooltip-content>
            {t('duration_picker.helper')}
          </wz-tooltip-content>
        </wz-basic-tooltip>
      </div>
    </wz-text-input>
  );
}
