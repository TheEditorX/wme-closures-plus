import { SyntheticEvent } from 'react';
import { ALL_DAYS, NO_DAYS } from './consts/days-presets';
import { DayCheckbox } from './DayCheckbox';
import { Day } from './enums';
import styled from '@emotion/styled';

const AVAILABLE_DAYS = [
  // @i18n common.day.SU
  { day: Day.Sunday, label: 'Sunday' },
  // @i18n common.day.MO
  { day: Day.Monday, label: 'Monday' },
  // @i18n common.day.TU
  { day: Day.Tuesday, label: 'Tuesday' },
  // @i18n common.day.WE
  { day: Day.Wednesday, label: 'Wednesday' },
  // @i18n common.day.TH
  { day: Day.Thursday, label: 'Thursday' },
  // @i18n common.day.FR
  { day: Day.Friday, label: 'Friday' },
  // @i18n common.day.SA
  { day: Day.Saturday, label: 'Saturday' },
];

const HeadlineContainer = styled('div')({
  display: 'flex',
  'wz-label': {
    flex: 1,
  },
});

export interface DaySelectorProps {
  value: readonly Day[];
  onDayChange: (day: Day, state: boolean) => void;
  onChange: (newValue: readonly Day[]) => void;
  label?: string;
  showShortcuts?: boolean;
}
export function DaySelector({
  value,
  onDayChange,
  onChange,
  label = 'Select days',
  showShortcuts = true,
}: DaySelectorProps) {
  const createShortcutButtonHandler = (days: readonly Day[]) => {
    return (event: SyntheticEvent<HTMLButtonElement>) => {
      event.currentTarget.blur();
      onChange(days);
    };
  };

  return (
    <div>
      <HeadlineContainer>
        <wz-label>{label}</wz-label>
        {showShortcuts && (
          <>
            <wz-button
              color="text"
              size="xs"
              onClick={createShortcutButtonHandler(ALL_DAYS)}
            >
              Select all
            </wz-button>
            <wz-button
              color="text"
              size="xs"
              onClick={createShortcutButtonHandler(NO_DAYS)}
            >
              Select none
            </wz-button>
          </>
        )}
      </HeadlineContainer>

      {AVAILABLE_DAYS.map(({ day, label }) => (
        <DayCheckbox
          key={day}
          day={day}
          checked={value.includes(day)}
          onChange={onDayChange.bind(null, day)}
        >
          {label}
        </DayCheckbox>
      ))}
    </div>
  );
}
