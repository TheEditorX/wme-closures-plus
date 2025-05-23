import { Toggle, ToggleGroup } from '@base-ui-components/react';
import styled from '@emotion/styled';
import { SyntheticEvent, useState } from 'react';
import { TimeOnly } from '../../../../classes';
import { WeekdayFlags } from '../../../../enums';
import { DurationPicker } from '../../../DurationPicker';
import { createUseStepState } from '../../../stepper';
import { PositionAwareToggleButton } from '../../../ToggleButton';
import { WeekdayPicker } from '../../../WeekdayPicker';
import { PresetEditForm } from '../components';
import { STEP_CLOSURE_DETAILS_SYMBOL } from '../consts';
import { PresetEditDialogData } from '../interfaces';

const TwoColumnsGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--space-always-xs, 8px)',
});

type ClosureDetailsDialogData =
  PresetEditDialogData[typeof STEP_CLOSURE_DETAILS_SYMBOL];
const useClosureDetailsState = createUseStepState<ClosureDetailsDialogData>();

export function ClosureDetailsStep() {
  const [description, setDescription] = useClosureDetailsState('description');
  const [startDate, setStartDate] = useClosureDetailsState('startDate');
  const [startTimeMode, setStartTimeMode] = useState<'IMMEDIATE' | 'FIXED'>(
    'IMMEDIATE',
  );
  const [startTime, setStartTime] = useClosureDetailsState('startTime');
  const [endTime, setEndTime] = useClosureDetailsState('endTime');

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
        <wz-label>* Closure&#39;s start date</wz-label>
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
            marginBottom: 'var(--space-always-xs, 8px)',
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

      <TwoColumnsGrid>
        <div>
          <wz-label>* Closure&#39;s start time</wz-label>
          <ToggleGroup
            value={[startTimeMode]}
            onValueChange={([value]) => {
              setStartTimeMode(value);
              if (value === 'FIXED' && !startTime) {
                setStartTime(new TimeOnly());
              }
            }}
            style={{
              display: 'flex',
              marginBottom: 'var(--space-always-xs, 8px)',
            }}
          >
            <Toggle
              value="IMMEDIATE"
              render={
                <PositionAwareToggleButton style={{ flex: 1 }}>
                  Immediately
                </PositionAwareToggleButton>
              }
            />
            <Toggle
              value="FIXED"
              render={
                <PositionAwareToggleButton style={{ flex: 1 }}>
                  Specific time
                </PositionAwareToggleButton>
              }
            />
          </ToggleGroup>

          <wz-text-input
            ref={(input: HTMLInputElement) => {
              const jQueryInput = $(input) as JQuery<HTMLInputElement> & {
                timepicker(options: object): void;
              };
              jQueryInput.timepicker({
                defaultTime: false,
                showMeridian: false,
                template: false,
              });
            }}
            disabled={startTimeMode !== 'FIXED'}
            placeholder="--:--"
            value={
              startTimeMode === 'FIXED' && startTime ?
                `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`
              : ''
            }
            onChange={(e: SyntheticEvent<HTMLInputElement, InputEvent>) =>
              setStartTime(new TimeOnly(e.currentTarget.value))
            }
          />
        </div>

        <div>
          <wz-label>* Closure&#39;s end time</wz-label>
          <ToggleGroup
            value={[endTime?.type].filter(Boolean)}
            onValueChange={([value]) => {
              switch (value) {
                case 'FIXED': {
                  const timeInOneHour = new TimeOnly();
                  timeInOneHour.setHours(timeInOneHour.getHours() + 1);
                  return setEndTime({ type: 'FIXED', value: timeInOneHour });
                }
                case 'DURATIONAL':
                  return setEndTime({ type: 'DURATIONAL', duration: NaN });
              }
              setStartTimeMode(value);
              if (value === 'FIXED' && !startTime) {
                setStartTime(new TimeOnly());
              }
            }}
            style={{
              display: 'flex',
              marginBottom: 'var(--space-always-xs, 8px)',
            }}
          >
            {/* add a fictive toggle to prevent from BaseUI selecting the first option by default */}
            <Toggle style={{ display: 'none' }} value=""></Toggle>

            <Toggle
              value="FIXED"
              render={
                <PositionAwareToggleButton style={{ flex: 1 }}>
                  Specific time
                </PositionAwareToggleButton>
              }
            />
            <Toggle
              value="DURATIONAL"
              render={
                <PositionAwareToggleButton style={{ flex: 1 }}>
                  Durational
                </PositionAwareToggleButton>
              }
            />
          </ToggleGroup>

          {endTime?.type === 'FIXED' ?
            <wz-text-input
              ref={(input: HTMLInputElement) => {
                const jQueryInput = $(input) as JQuery<HTMLInputElement> & {
                  timepicker(options: object): void;
                };
                jQueryInput.timepicker({
                  defaultTime: false,
                  showMeridian: false,
                  template: false,
                });
              }}
              placeholder="--:--"
              value={
                endTime.value ?
                  `${endTime.value.getHours().toString().padStart(2, '0')}:${endTime.value.getMinutes().toString().padStart(2, '0')}`
                : ''
              }
              onChange={(e: SyntheticEvent<HTMLInputElement, InputEvent>) =>
                setEndTime({
                  type: 'FIXED',
                  value: new TimeOnly(e.currentTarget.value),
                })
              }
            />
          : endTime?.type === 'DURATIONAL' && <DurationPicker />}
        </div>
      </TwoColumnsGrid>
    </PresetEditForm>
  );
}
