import { useImperativeHandle, useState } from 'react';
import { RecurringModeFormProps } from '../recurring-mode';
import { Day } from './enums';
import { DaySelector } from './DaySelector';
import { useTranslation } from '../../../../../hooks';

export interface DailyConfigFormFields {
  days: readonly Day[];
}
export function DailyConfigForm(
  props: RecurringModeFormProps<DailyConfigFormFields>,
) {
  const { t } = useTranslation();
  const [selectedDays, setSelectedDays] = useState<readonly Day[]>(
    props.initialFieldValues?.days ?? [],
  );

  useImperativeHandle(
    props.fieldsValuesRef,
    () => ({
      days: selectedDays,
    }),
    [selectedDays],
  );

  props.setButtonState('APPLY', selectedDays.length > 0);

  return (
    <>
      <DaySelector
        value={selectedDays}
        onChange={(newValue) => setSelectedDays(newValue)}
        onDayChange={(day, state) => {
          setSelectedDays((selectedDays) => {
            const dayIndex = selectedDays.indexOf(day);
            if (state && dayIndex !== -1) return;
            if (!state && dayIndex === -1) return;
            if (state) return [...selectedDays, day];
            return [
              ...selectedDays.slice(0, dayIndex),
              ...selectedDays.slice(dayIndex + 1),
            ];
          });
        }}
      />

      <wz-caption
        style={{
          display: 'inline-block',
          marginTop: 'var(--space-always-xs, 8px)',
        }}
      >
        {t('edit.closure.recurrence.daily.recurrence_explanation')}
      </wz-caption>
    </>
  );
}
