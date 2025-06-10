import { Toggle, ToggleGroup } from '@base-ui-components/react';
import styled from '@emotion/styled';
import { SyntheticEvent, useState } from 'react';
import { TimeOnly } from '../../../../classes';
import { WeekdayFlags } from '../../../../enums';
import { useTranslation } from '../../../../hooks';
import { DurationPicker } from '../../../DurationPicker';
import { TimePicker } from '../../../TimePicker';
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
  const [startTime, setStartTime] = useClosureDetailsState('startTime');
  const [endTime, setEndTime] = useClosureDetailsState('endTime');
  const [startTimeMode, setStartTimeMode] = useState<'IMMEDIATE' | 'FIXED'>(
    startTime ? 'FIXED' : 'IMMEDIATE',
  );
  const [isPostponeEnabled, setIsPostponeEnabled] = useState(
    () => endTime?.type === 'FIXED' && !!endTime?.postponeBy,
  );
  const [postponeRecoverValue, setPostponeRecoverValue] = useState<
    number | null
  >(null);

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

          <TimePicker
            disabled={startTimeMode !== 'FIXED'}
            placeholder="--:--"
            value={startTimeMode === 'FIXED' ? startTime : undefined}
            onChange={(timeValue) => {
              setStartTime(timeValue);
            }}
            onBlur={(timeValue) => {
              setStartTime(timeValue);
            }}
            timePickerOptions={{
              defaultTime: false,
              showMeridian: false,
              template: false,
            }}
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
                  return setEndTime({
                    type: 'FIXED',
                    value: timeInOneHour,
                    postponeBy: 0,
                  });
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
            <>
              <TimePicker
                style={{
                  marginBottom: 'var(--space-always-xs, 8px)',
                  display: 'block',
                }}
                placeholder="--:--"
                value={endTime.value}
                onChange={(timeValue) => {
                  setEndTime((prevEndTime) => ({
                    type: 'FIXED',
                    value: timeValue,
                    postponeBy:
                      (prevEndTime.type === 'FIXED' &&
                        prevEndTime.postponeBy) ||
                      0,
                  }));
                }}
                onBlur={(timeValue) => {
                  setEndTime((prevEndTime) => ({
                    type: 'FIXED',
                    value: timeValue,
                    postponeBy:
                      (prevEndTime.type === 'FIXED' &&
                        prevEndTime.postponeBy) ||
                      0,
                  }));
                }}
                timePickerOptions={{
                  defaultTime: false,
                  showMeridian: false,
                  template: false,
                }}
              />

              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-always-xs, 8px)',
                }}
              >
                <wz-checkbox
                  checked={isPostponeEnabled}
                  onChange={(event: SyntheticEvent<HTMLInputElement>) => {
                    event.preventDefault();
                    setIsPostponeEnabled(event.currentTarget.checked);
                    if (event.currentTarget.checked) {
                      // the checkbox is now selected
                      // we need to restore the persisted value if we have any
                      setEndTime((prevEndTime) => {
                        if (prevEndTime?.type !== 'FIXED') return prevEndTime;

                        return {
                          ...prevEndTime,
                          postponeBy: postponeRecoverValue,
                        };
                      });
                    } else {
                      // the checkbox is now deselected
                      // we need to update the value of the end time to 0
                      // and we need to preserve the existing value
                      // for that we'll use nested updaters
                      setEndTime((prevEndTime) => {
                        if (prevEndTime?.type !== 'FIXED') return prevEndTime;

                        setPostponeRecoverValue(prevEndTime.postponeBy);
                        return {
                          ...prevEndTime,
                          postponeBy: 0,
                        };
                      });
                    }
                  }}
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
                  onChange={(value) => {
                    setEndTime((prevEndTime) => {
                      if (prevEndTime?.type !== 'FIXED') return prevEndTime;

                      return {
                        ...prevEndTime,
                        postponeBy: value,
                      };
                    });
                  }}
                />
              </div>
            </>
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
