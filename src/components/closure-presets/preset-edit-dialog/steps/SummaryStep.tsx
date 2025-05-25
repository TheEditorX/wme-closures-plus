import React from 'react';
import { createUseStepState } from '../../../stepper';
import {
  STEP_PRESET_INFO_SYMBOL,
  STEP_CLOSURE_DETAILS_SYMBOL,
} from '../consts';
import { PresetEditDialogData } from '../interfaces';
import { TimeOnly } from '../../../../classes'; // Assuming TimeOnly might be needed for formatting
import { WeekdayFlags } from '../../../../enums'; // Assuming WeekdayFlags might be needed

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
): string => {
  if (!startDate) return 'Not set';
  if (startDate.type === 'CURRENT_DAY') return 'Activation Date';
  if (startDate.type === 'DAY_OF_WEEK') {
    if (startDate.value instanceof WeekdayFlags) {
      const days: string[] = [];
      if (startDate.value.has(WeekdayFlags.Sunday)) days.push('Sun');
      if (startDate.value.has(WeekdayFlags.Monday)) days.push('Mon');
      if (startDate.value.has(WeekdayFlags.Tuesday)) days.push('Tue');
      if (startDate.value.has(WeekdayFlags.Wednesday)) days.push('Wed');
      if (startDate.value.has(WeekdayFlags.Thursday)) days.push('Thu');
      if (startDate.value.has(WeekdayFlags.Friday)) days.push('Fri');
      if (startDate.value.has(WeekdayFlags.Saturday)) days.push('Sat');
      return days.length > 0 ? days.join(', ') : 'No days selected';
    }
    return 'Specific Day (Invalid Data)';
  }
  return 'Not set';
};

// Helper function to format TimeOnly
const formatTime = (time: TimeOnly | null): string => {
  if (!time) return 'Not set';
  if (time instanceof TimeOnly) {
    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  }
  return 'Invalid time';
};

// Helper function to format EndTime
const formatEndTime = (
  endTime: PresetEditDialogData[typeof STEP_CLOSURE_DETAILS_SYMBOL]['endTime'],
): string => {
  if (!endTime) return 'Not set';
  if (endTime.type === 'FIXED') return formatTime(endTime.value);
  if (endTime.type === 'DURATIONAL') {
    return endTime.duration && !isNaN(endTime.duration) ?
        `${endTime.duration} minutes`
      : 'Duration not set';
  }
  return 'Not set';
};

export function SummaryStep() {
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
          item-key="Preset Name"
          value={presetName || 'Not set'}
        ></wz-list-item>
        <wz-list-item
          item-key="Preset Description"
          value={presetDescription || 'Not set'}
        ></wz-list-item>
        <wz-list-item
          item-key="Closure Description"
          value={closureDescription || 'Not set'}
        ></wz-list-item>
        <wz-list-item
          item-key="Start Date"
          value={formatStartDate(startDate)}
        ></wz-list-item>
        <wz-list-item
          item-key="Start Time"
          value={startTime ? formatTime(startTime) : 'Immediately'}
        ></wz-list-item>
        <wz-list-item
          item-key="End Time"
          value={formatEndTime(endTime)}
        ></wz-list-item>
      </wz-list>
    </div>
  );
}
