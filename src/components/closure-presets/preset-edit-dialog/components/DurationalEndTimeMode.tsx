import { SyntheticEvent } from 'react';
import { useTranslation } from 'hooks';
import { DurationPicker } from 'components/DurationPicker';
import { FlexRow, SpacedBlock } from './CommonLayouts';

interface DurationalEndTimeData {
  type: 'DURATIONAL';
  duration: number;
  roundUpTo?: number;
}

interface DurationalEndTimeModeProps {
  endTime: DurationalEndTimeData;
  onEndTimeChange: (endTime: DurationalEndTimeData) => void;
  isRoundUpEnabled: boolean;
  onRoundUpEnabledChange: (enabled: boolean) => void;
  roundUpRecoverValue: number | null;
  onRoundUpRecoverValueChange: (value: number | null) => void;
}

export function DurationalEndTimeMode({
  endTime,
  onEndTimeChange,
  isRoundUpEnabled,
  onRoundUpEnabledChange,
  roundUpRecoverValue,
  onRoundUpRecoverValueChange,
}: DurationalEndTimeModeProps) {
  const { t } = useTranslation();

  const handleDurationChange = (value: number) => {
    onEndTimeChange({
      ...endTime,
      duration: value,
    });
  };

  const handleRoundUpToggle = (event: SyntheticEvent<HTMLInputElement>) => {
    event.preventDefault();
    const isChecked = event.currentTarget.checked;
    onRoundUpEnabledChange(isChecked);

    if (isChecked) {
      // Restore the persisted value if we have any, default to 10 minutes
      onEndTimeChange({
        ...endTime,
        roundUpTo: roundUpRecoverValue || 10,
      });
    } else {
      // Preserve the existing value and set roundUpTo to undefined
      onRoundUpRecoverValueChange(endTime.roundUpTo ?? null);
      onEndTimeChange({
        ...endTime,
        roundUpTo: undefined,
      });
    }
  };

  const handleRoundUpValueChange = (
    event: SyntheticEvent<HTMLSelectElement>,
  ) => {
    const value = parseInt(event.currentTarget.value, 10);
    onEndTimeChange({
      ...endTime,
      roundUpTo: value,
    });
  };

  return (
    <>
      <SpacedBlock>
        <DurationPicker
          value={endTime.duration}
          onChange={handleDurationChange}
        />
      </SpacedBlock>

      <FlexRow>
        <wz-checkbox checked={isRoundUpEnabled} onChange={handleRoundUpToggle}>
          {t(
            'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.round_up_to',
          )}
        </wz-checkbox>
        <wz-select
          style={{
            minWidth: 'unset',
            flex: 1,
          }}
          disabled={!isRoundUpEnabled}
          value={endTime.roundUpTo?.toString() || '10'}
          onClick={(e) => {
            e.stopPropagation(); // prevent the checkbox from deactivating
          }}
          onChange={handleRoundUpValueChange}
        >
          <wz-option value="10">
            {t(
              'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.round_up_options.10_minutes',
            )}
          </wz-option>
          <wz-option value="15">
            {t(
              'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.round_up_options.15_minutes',
            )}
          </wz-option>
          <wz-option value="30">
            {t(
              'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.round_up_options.30_minutes',
            )}
          </wz-option>
          <wz-option value="60">
            {t(
              'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.round_up_options.hour',
            )}
          </wz-option>
        </wz-select>
      </FlexRow>
    </>
  );
}
