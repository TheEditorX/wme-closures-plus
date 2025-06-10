import React from 'react';
import { createUseStepState } from '../../../stepper';
import {
  STEP_PRESET_INFO_SYMBOL,
  STEP_CLOSURE_DETAILS_SYMBOL,
} from '../consts';
import { PresetEditDialogData } from '../interfaces';
import { TimeOnly } from '../../../../classes'; // Assuming TimeOnly might be needed for formatting
import { WeekdayFlags } from '../../../../enums'; // Assuming WeekdayFlags might be needed
import { useTranslation } from '../../../../hooks';

const usePresetInfoState = createUseStepState<
  PresetEditDialogData,
  typeof STEP_PRESET_INFO_SYMBOL
>(STEP_PRESET_INFO_SYMBOL);
const useClosureDetailsState = createUseStepState<
  PresetEditDialogData,
  typeof STEP_CLOSURE_DETAILS_SYMBOL
>(STEP_CLOSURE_DETAILS_SYMBOL);

// Helper function to format StartDate
const formatStartDate = (
  startDate: PresetEditDialogData[typeof STEP_CLOSURE_DETAILS_SYMBOL]['startDate'],
  t: (key: string, params?: object) => string,
  unsafeT: (key: string, params?: object) => string,
): string => {
  if (!startDate) return t('common.not_set');
  if (startDate.type === 'CURRENT_DATE')
    return t(
      'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_date.modes.CURRENT_DATE',
    );
  if (startDate.type === 'DAY_OF_WEEK') {
    if (startDate.value instanceof WeekdayFlags) {
      const days: string[] = [];
      if (startDate.value.has(WeekdayFlags.Sunday))
        days.push(unsafeT('common.day-shorten.SU'));
      if (startDate.value.has(WeekdayFlags.Monday))
        days.push(unsafeT('common.day-shorten.MO'));
      if (startDate.value.has(WeekdayFlags.Tuesday))
        days.push(unsafeT('common.day-shorten.TU'));
      if (startDate.value.has(WeekdayFlags.Wednesday))
        days.push(unsafeT('common.day-shorten.WE'));
      if (startDate.value.has(WeekdayFlags.Thursday))
        days.push(unsafeT('common.day-shorten.TH'));
      if (startDate.value.has(WeekdayFlags.Friday))
        days.push(unsafeT('common.day-shorten.FR'));
      if (startDate.value.has(WeekdayFlags.Saturday))
        days.push(unsafeT('common.day-shorten.SA'));
      return days.length > 0 ? days.join(', ') : 'No days selected';
    }
    return 'Specific Day (Invalid Data)';
  }
  return t('common.not_set');
};

// Helper function to format TimeOnly
const formatTime = (
  time: TimeOnly | null,
  t: (key: string, params?: object) => string,
): string => {
  if (!time) return t('common.not_set');
  if (time instanceof TimeOnly) {
    return time.formatAsTimeInput();
  }
  return t('common.invalid_time');
};

// Helper function to format EndTime
const formatEndTime = (
  endTime: PresetEditDialogData[typeof STEP_CLOSURE_DETAILS_SYMBOL]['endTime'],
  t: (key: string, params?: object) => string,
): string => {
  if (!endTime) return t('common.not_set');
  if (endTime.type === 'FIXED') return formatTime(endTime.value, t);
  if (endTime.type === 'DURATIONAL') {
    return endTime.duration && !isNaN(endTime.duration) ?
        `${endTime.duration} minutes`
      : t('common.not_set');
  }
  return t('common.not_set');
};

export function SummaryStep() {
  const { t, unsafeT } = useTranslation();
  const [presetName] = usePresetInfoState('name');
  const [presetDescription] = usePresetInfoState('description');
  const [closureDescription] = useClosureDetailsState('description');
  const [startDate] = useClosureDetailsState('startDate');
  const [startTime] = useClosureDetailsState('startTime');
  const [endTime] = useClosureDetailsState('endTime');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-m)',
      }}
    >
      <wz-list>
        <wz-list-item
          item-key={t(
            'edit.closure_preset.edit_dialog.steps.PRESET_INFO.preset_name.label',
          )}
          value={presetName || t('common.not_set')}
        ></wz-list-item>
        <wz-list-item
          item-key={t(
            'edit.closure_preset.edit_dialog.steps.PRESET_INFO.preset_description.label',
          )}
          value={presetDescription || t('common.not_set')}
        ></wz-list-item>
        <wz-list-item
          item-key={t(
            'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_description.label',
          )}
          value={closureDescription || t('common.not_set')}
        ></wz-list-item>
        <wz-list-item
          item-key={t(
            'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_date.label',
          )}
          value={formatStartDate(startDate, t, unsafeT)}
        ></wz-list-item>
        <wz-list-item
          item-key={t(
            'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_time.label',
          )}
          value={
            startTime ?
              formatTime(startTime, t)
            : t(
                'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_start_time.modes.IMMEDIATE',
              )
          }
        ></wz-list-item>
        <wz-list-item
          item-key={t(
            'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.closure_end_time.label',
          )}
          value={formatEndTime(endTime, t)}
        ></wz-list-item>
      </wz-list>
    </div>
  );
}
