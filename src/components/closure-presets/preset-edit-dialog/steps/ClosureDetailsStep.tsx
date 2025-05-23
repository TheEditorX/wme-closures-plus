import { Toggle, ToggleGroup } from '@base-ui-components/react';
import { SyntheticEvent } from 'react';
import { WeekdayFlags } from '../../../../enums';
import { createUseStepState } from '../../../stepper';
import { PositionAwareToggleButton } from '../../../ToggleButton';
import { WeekdayPicker } from '../../../WeekdayPicker';
import { PresetEditForm } from '../components';
import { STEP_CLOSURE_DETAILS_SYMBOL } from '../consts';
import { PresetEditDialogData } from '../interfaces';

type ClosureDetailsDialogData =
  PresetEditDialogData[typeof STEP_CLOSURE_DETAILS_SYMBOL];
const useClosureDetailsState = createUseStepState<ClosureDetailsDialogData>();

export function ClosureDetailsStep() {
  const [description, setDescription] = useClosureDetailsState('description');
  const [startDate, setStartDate] = useClosureDetailsState('startDate');

  return (
    <PresetEditForm>
      <wz-text-input
        label="Closure description"
        placeholder="Road is closed for construction"
        helper-message="This description will be shown in the Waze app"
        value={description}
        onChange={(e: SyntheticEvent<HTMLInputElement, InputEvent>) =>
          setDescription(e.currentTarget.value)
        }
      />

      <div>
        <wz-label>Closure&#39;s start date</wz-label>
        <ToggleGroup
          value={[startDate?.type]}
          onValueChange={([value]) => {
            switch (value) {
              case 'CURRENT_DAY':
                return setStartDate({ type: 'CURRENT_DAY' });
              case 'DAY_OF_WEEK':
                return setStartDate({
                  type: 'DAY_OF_WEEK',
                  value: new WeekdayFlags(0),
                });
            }
          }}
          style={{
            display: 'flex',
          }}
        >
          <Toggle
            value="CURRENT_DAY"
            render={
              <PositionAwareToggleButton style={{ flex: 1 }}>
                Activation Date
              </PositionAwareToggleButton>
            }
          />
          <Toggle
            value="DAY_OF_WEEK"
            render={
              <PositionAwareToggleButton style={{ flex: 1 }}>
                Specific Day
              </PositionAwareToggleButton>
            }
          />
        </ToggleGroup>
        {startDate?.type === 'DAY_OF_WEEK' && (
          <WeekdayPicker
            fullWidth
            value={startDate.value}
            onChange={(day) =>
              setStartDate({ type: 'DAY_OF_WEEK', value: day })
            }
          />
        )}
      </div>
    </PresetEditForm>
  );
}
