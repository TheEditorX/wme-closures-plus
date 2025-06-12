import { SyntheticEvent } from 'react';
import { TimeOnly } from 'classes';
import { useTranslation, useToggleableState } from 'hooks';
import { DurationPicker } from 'components/DurationPicker';
import { TimePicker } from 'components/TimePicker';
import { FlexRow, SpacedBlock } from './CommonLayouts';
import { createUseStepState } from '../../../stepper';
import { STEP_CLOSURE_DETAILS_SYMBOL } from '../consts';
import { PresetEditDialogData } from '../interfaces';

interface FixedEndTimeData {
  type: 'FIXED';
  value: TimeOnly;
  postponeBy: number;
}

type ClosureDetailsDialogData =
  PresetEditDialogData[typeof STEP_CLOSURE_DETAILS_SYMBOL];
const useClosureDetailsState = createUseStepState<ClosureDetailsDialogData>();

export function FixedEndTimeMode() {
  const { t } = useTranslation();
  const [endTime, setEndTime] = useClosureDetailsState('endTime');

  const [postponeValue, setPostponeValue, isPostponeEnabled, setIsPostponeEnabled] =
    useToggleableState<number>({
      initialValue: endTime?.type === 'FIXED' && endTime.postponeBy ? endTime.postponeBy : 0, // use existing value or default
      initialEnabled: endTime?.type === 'FIXED' && !!endTime.postponeBy, // enabled if postponeBy > 0
      onEnabled: (value) => {
        // onEnabled: restore value to step data
        if (endTime?.type !== 'FIXED') return;
        setEndTime({
          ...endTime,
          postponeBy: value,
        });
      },
      onDisabled: () => {
        // onDisabled: set to 0 in step data
        if (endTime?.type !== 'FIXED') return;
        setEndTime({
          ...endTime,
          postponeBy: 0,
        });
      },
      onValueChanged: (value) => {
        // onValueChanged: update step data when enabled
        if (endTime?.type !== 'FIXED') return;
        setEndTime({
          ...endTime,
          postponeBy: value,
        });
      },
    });

  const handleTimeChange = (timeValue: TimeOnly | null) => {
    if (!timeValue || endTime?.type !== 'FIXED') return;
    setEndTime({
      ...endTime,
      value: timeValue,
    });
  };

  const handlePostponeToggle = (event: SyntheticEvent<HTMLInputElement>) => {
    event.preventDefault();
    setIsPostponeEnabled(event.currentTarget.checked);
  };

  const handlePostponeValueChange = (value: number) => {
    setPostponeValue(value);
  };

  if (endTime?.type !== 'FIXED') {
    return null;
  }

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
          value={postponeValue}
          onChange={handlePostponeValueChange}
        />
      </FlexRow>
    </>
  );
}
