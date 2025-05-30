import { SyntheticEvent } from 'react';
import { ALL_DAYS, NO_DAYS } from './consts/days-presets';
import { DayCheckbox } from './DayCheckbox';
import { Day } from './enums';
import styled from '@emotion/styled';
import { useTranslation } from '../../../../../hooks';

const AVAILABLE_DAYS = [
  { day: Day.Sunday, key: 'common.day.SU' },
  { day: Day.Monday, key: 'common.day.MO' },
  { day: Day.Tuesday, key: 'common.day.TU' },
  { day: Day.Wednesday, key: 'common.day.WE' },
  { day: Day.Thursday, key: 'common.day.TH' },
  { day: Day.Friday, key: 'common.day.FR' },
  { day: Day.Saturday, key: 'common.day.SA' },
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
  const { t } = useTranslation();
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
              {t('day_picker.select_all')}
            </wz-button>
            <wz-button
              color="text"
              size="xs"
              onClick={createShortcutButtonHandler(NO_DAYS)}
            >
              {t('day_picker.select_none')}
            </wz-button>
          </>
        )}
      </HeadlineContainer>

      {AVAILABLE_DAYS.map(({ day, key }) => (
        <DayCheckbox
          key={day}
          day={day}
          checked={value.includes(day)}
          onChange={onDayChange.bind(null, day)}
        >
          {t(key)}
        </DayCheckbox>
      ))}
    </div>
  );
}
