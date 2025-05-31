import { Toggle, ToggleGroup } from '@base-ui-components/react';
import styled from '@emotion/styled';
import { SyntheticEvent, useState } from 'react';
import { TimeOnly } from '../../../../classes';
import { WeekdayFlags } from '../../../../enums';
import { useTranslation } from '../../../../hooks';
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
  const { t } = useTranslation();
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
        <wz-label>
          *{' '}
          {t(
            'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_date.label',
          )}
        </wz-label>
        <ToggleGroup
          value={[startDate?.type]}
          onValueChange={([value]) => {
            switch (value) {
              case 'CURRENT_DATE':
                return setStartDate({ type: 'CURRENT_DATE' });
              case 'DAY_OF_WEEK':
                return setStartDate({
                  type: 'DAY_OF_WEEK',
                  value: new WeekdayFlags(0),
                });
              default:
                console.warn(`Unexpected start date type: ${value}`);
                return;
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
            value="CURRENT_DATE"
            render={
              <PositionAwareToggleButton style={{ flex: 1 }}>
                {t(
                  'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_date.modes.CURRENT_DATE',
                )}
              </PositionAwareToggleButton>
            }
          />
          <Toggle
            value="DAY_OF_WEEK"
            render={
              <PositionAwareToggleButton style={{ flex: 1 }}>
                {t(
                  'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_date.modes.DAY_OF_WEEK',
                )}
              </PositionAwareToggleButton>
            }
          />
        </ToggleGroup>
        {startDate?.type === 'DAY_OF_WEEK' && (
          <>
            <WeekdayPicker
              fullWidth
              value={startDate.value}
              allowMultiple
              onChange={(day) =>
                setStartDate({ type: 'DAY_OF_WEEK', value: day })
              }
            />

            <wz-caption>
              {t(
                'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_date.day_of_week_disclaimer',
              )}
            </wz-caption>
          </>
        )}
      </div>

      <TwoColumnsGrid>
        <div>
          <wz-label>
            *{' '}
            {t(
              'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_time.label',
            )}
          </wz-label>
          <ToggleGroup
            value={[startTimeMode]}
            onValueChange={([value]) => {
              setStartTimeMode(value);
              if (value === 'FIXED' && !startTime) {
                setStartTime(new TimeOnly());
              } else if (value === 'IMMEDIATE') {
                setStartTime(null);
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
              value="IMMEDIATE"
              render={
                <PositionAwareToggleButton style={{ flex: 1 }}>
                  {t(
                    'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_time.modes.IMMEDIATE',
                  )}
                </PositionAwareToggleButton>
              }
            />
            <Toggle
              value="FIXED"
              render={
                <PositionAwareToggleButton style={{ flex: 1 }}>
                  {t(
                    'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_time.modes.FIXED',
                  )}
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
          <wz-label>
            *{' '}
            {t(
              'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.label',
            )}
          </wz-label>
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
                default:
                  console.warn(`Unexpected end time type: ${value}`);
                  break;
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
                  {t(
                    'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.modes.FIXED',
                  )}
                </PositionAwareToggleButton>
              }
            />
            <Toggle
              value="DURATIONAL"
              render={
                <PositionAwareToggleButton style={{ flex: 1 }}>
                  {t(
                    'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.modes.DURATIONAL',
                  )}
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
          : endTime?.type === 'DURATIONAL' && (
              <DurationPicker
                value={endTime.duration}
                onChange={(value) =>
                  setEndTime({ type: 'DURATIONAL', duration: value })
                }
              />
            )
          }
        </div>
      </TwoColumnsGrid>
    </PresetEditForm>
  );
}
