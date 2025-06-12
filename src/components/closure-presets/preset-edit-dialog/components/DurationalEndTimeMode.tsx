import { SyntheticEvent } from 'react';
import { useTranslation, useToggleableState } from 'hooks';
import { DurationPicker } from 'components/DurationPicker';
import { FlexRow, SpacedBlock } from './CommonLayouts';
import { createUseStepState } from '../../../stepper';
import { STEP_CLOSURE_DETAILS_SYMBOL } from '../consts';
import { PresetEditDialogData } from '../interfaces';

interface DurationalEndTimeData {
  type: 'DURATIONAL';
  duration: number;
  roundUpTo?: number;
}

type ClosureDetailsDialogData =
  PresetEditDialogData[typeof STEP_CLOSURE_DETAILS_SYMBOL];
const useClosureDetailsState = createUseStepState<ClosureDetailsDialogData>();

const ROUND_UP_OPTIONS = [
  { value: 10, i18nKey: '10_minutes' },
  { value: 15, i18nKey: '15_minutes' },
  { value: 30, i18nKey: '30_minutes' },
  { value: 60, i18nKey: 'hour' },
] as const;

export function DurationalEndTimeMode() {
  const { t } = useTranslation();
  const [endTime, setEndTime] = useClosureDetailsState('endTime');

  const [roundUpValue, setRoundUpValue, isRoundUpEnabled, setIsRoundUpEnabled] =
    useToggleableState<number>({
      initialValue: endTime?.type === 'DURATIONAL' && endTime.roundUpTo ? endTime.roundUpTo : 10, // use existing value or default
      initialEnabled: endTime?.type === 'DURATIONAL' && !!endTime.roundUpTo, // enabled if roundUpTo exists
      onEnabled: (value) => {
        // onEnabled: restore value to step data
        if (endTime?.type !== 'DURATIONAL') return;
        setEndTime({
          ...endTime,
          roundUpTo: value,
        });
      },
      onDisabled: () => {
        // onDisabled: remove from step data
        if (endTime?.type !== 'DURATIONAL') return;
        setEndTime({
          ...endTime,
          roundUpTo: undefined,
        });
      },
      onValueChanged: (value) => {
        // onValueChanged: update step data when enabled
        if (endTime?.type !== 'DURATIONAL') return;
        setEndTime({
          ...endTime,
          roundUpTo: value,
        });
      },
    });

  const handleDurationChange = (value: number) => {
    if (endTime?.type !== 'DURATIONAL') return;
    setEndTime({
      ...endTime,
      duration: value,
    });
  };

  const handleRoundUpToggle = (event: SyntheticEvent<HTMLInputElement>) => {
    event.preventDefault();
    setIsRoundUpEnabled(event.currentTarget.checked);
  };

  const handleRoundUpValueChange = (
    event: SyntheticEvent<HTMLSelectElement>,
  ) => {
    const value = parseInt(event.currentTarget.value, 10);
    setRoundUpValue(value);
  };

  if (endTime?.type !== 'DURATIONAL') {
    return null;
  }

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
          value={roundUpValue.toString()}
          onChange={handleRoundUpValueChange}
        >
          {ROUND_UP_OPTIONS.map((option) => (
            <wz-option key={option.value} value={option.value.toString()}>
              {t(
                `edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.round_up_options.${option.i18nKey}`,
              )}
            </wz-option>
          ))}
        </wz-select>
      </FlexRow>
    </>
  );
}
