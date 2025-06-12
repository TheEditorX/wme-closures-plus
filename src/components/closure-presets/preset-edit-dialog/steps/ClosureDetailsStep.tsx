import { SyntheticEvent, useState } from 'react';
import { TimeOnly } from '../../../../classes';
import { WeekdayFlags } from '../../../../enums';
import { useTranslation } from '../../../../hooks';
import { TimePicker } from '../../../TimePicker';
import { createUseStepState } from '../../../stepper';
import { WeekdayPicker } from '../../../WeekdayPicker';
import {
  DurationalEndTimeMode,
  FixedEndTimeMode,
  ModeToggleGroup,
  PresetEditForm,
  TwoColumnsGrid,
} from '../components';
import { STEP_CLOSURE_DETAILS_SYMBOL } from '../consts';
import { PresetEditDialogData } from '../interfaces';

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
  const [isRoundUpEnabled, setIsRoundUpEnabled] = useState(
    () => endTime?.type === 'DURATIONAL' && !!endTime?.roundUpTo,
  );
  const [roundUpRecoverValue, setRoundUpRecoverValue] = useState<number | null>(
    null,
  );

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
        <ModeToggleGroup
          value={startDate?.type}
          onValueChange={(value) => {
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
          options={[
            {
              value: 'CURRENT_DATE',
              label: t(
                'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_date.modes.CURRENT_DATE',
              ),
            },
            {
              value: 'DAY_OF_WEEK',
              label: t(
                'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_date.modes.DAY_OF_WEEK',
              ),
            },
          ]}
        />
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
          <ModeToggleGroup
            value={startTimeMode}
            onValueChange={(value) => {
              setStartTimeMode(value as 'IMMEDIATE' | 'FIXED');
              if (value === 'FIXED' && !startTime) {
                setStartTime(new TimeOnly());
              } else if (value === 'IMMEDIATE') {
                setStartTime(null);
              }
            }}
            options={[
              {
                value: 'IMMEDIATE',
                label: t(
                  'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_time.modes.IMMEDIATE',
                ),
              },
              {
                value: 'FIXED',
                label: t(
                  'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_time.modes.FIXED',
                ),
              },
            ]}
          />

          <TimePicker
            disabled={startTimeMode !== 'FIXED'}
            placeholder="--:--"
            value={startTimeMode === 'FIXED' ? startTime : undefined}
            onChange={(timeValue) => {
              if (!timeValue) return;
              setStartTime(timeValue);
            }}
            onBlur={(timeValue) => {
              if (!timeValue) return;
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
          <ModeToggleGroup
            value={endTime?.type}
            onValueChange={(value) => {
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
            options={[
              {
                value: 'FIXED',
                label: t(
                  'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.modes.FIXED',
                ),
              },
              {
                value: 'DURATIONAL',
                label: t(
                  'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.modes.DURATIONAL',
                ),
              },
            ]}
          />

          {endTime?.type === 'FIXED' && (
            <FixedEndTimeMode
              endTime={endTime}
              onEndTimeChange={(newEndTime) => setEndTime(() => newEndTime)}
              isPostponeEnabled={isPostponeEnabled}
              onPostponeEnabledChange={setIsPostponeEnabled}
              postponeRecoverValue={postponeRecoverValue}
              onPostponeRecoverValueChange={setPostponeRecoverValue}
            />
          )}

          {endTime?.type === 'DURATIONAL' && (
            <DurationalEndTimeMode
              endTime={endTime}
              onEndTimeChange={(newEndTime) => setEndTime(() => newEndTime)}
              isRoundUpEnabled={isRoundUpEnabled}
              onRoundUpEnabledChange={setIsRoundUpEnabled}
              roundUpRecoverValue={roundUpRecoverValue}
              onRoundUpRecoverValueChange={setRoundUpRecoverValue}
            />
          )}
        </div>
      </TwoColumnsGrid>
    </PresetEditForm>
  );
}
