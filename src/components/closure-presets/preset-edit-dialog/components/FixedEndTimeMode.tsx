import { SyntheticEvent } from 'react';
import { TimeOnly } from 'classes';
import { useTranslation } from 'hooks';
import { DurationPicker } from 'components/DurationPicker';
import { TimePicker } from 'components/TimePicker';
import { FlexRow, SpacedBlock } from './CommonLayouts';

interface FixedEndTimeData {
  type: 'FIXED';
  value: TimeOnly;
  postponeBy: number;
}

interface FixedEndTimeModeProps {
  endTime: FixedEndTimeData;
  onEndTimeChange: (endTime: FixedEndTimeData) => void;
  isPostponeEnabled: boolean;
  onPostponeEnabledChange: (enabled: boolean) => void;
  postponeRecoverValue: number | null;
  onPostponeRecoverValueChange: (value: number | null) => void;
}

export function FixedEndTimeMode({
  endTime,
  onEndTimeChange,
  isPostponeEnabled,
  onPostponeEnabledChange,
  postponeRecoverValue,
  onPostponeRecoverValueChange,
}: FixedEndTimeModeProps) {
  const { t } = useTranslation();

  const handleTimeChange = (timeValue: TimeOnly | null) => {
    if (!timeValue) return;
    onEndTimeChange({
      ...endTime,
      value: timeValue,
    });
  };

  const handlePostponeToggle = (event: SyntheticEvent<HTMLInputElement>) => {
    event.preventDefault();
    const isChecked = event.currentTarget.checked;
    onPostponeEnabledChange(isChecked);

    if (isChecked) {
      // Restore the persisted value if we have any
      onEndTimeChange({
        ...endTime,
        postponeBy: postponeRecoverValue ?? 0,
      });
    } else {
      // Preserve the existing value and set postpone to 0
      onPostponeRecoverValueChange(endTime.postponeBy);
      onEndTimeChange({
        ...endTime,
        postponeBy: 0,
      });
    }
  };

  const handlePostponeValueChange = (value: number) => {
    onEndTimeChange({
      ...endTime,
      postponeBy: value,
    });
  };

  return (
    <>
      <SpacedBlock>
        <TimePicker
          placeholder="--:--"
          value={endTime.value}
          onChange={handleTimeChange}
          onBlur={handleTimeChange}
          timePickerOptions={{
            defaultTime: false,
            showMeridian: false,
            template: false,
          }}
        />
      </SpacedBlock>

      <FlexRow>
        <wz-checkbox
          checked={isPostponeEnabled}
          onChange={handlePostponeToggle}
        >
          {t(
            'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.postpone_by',
          )}
        </wz-checkbox>
        <DurationPicker
          style={{
            minWidth: 'unset',
            flex: 1,
          }}
          disabled={!isPostponeEnabled}
          value={endTime.postponeBy ?? postponeRecoverValue}
          onClick={(e) => {
            e.stopPropagation(); // prevent the checkbox from deactivating
          }}
          onChange={handlePostponeValueChange}
        />
      </FlexRow>
    </>
  );
}
