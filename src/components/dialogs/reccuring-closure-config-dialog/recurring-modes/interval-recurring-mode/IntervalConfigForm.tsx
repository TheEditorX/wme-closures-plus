import styled from '@emotion/styled';
import { useTranslation } from '../../../../../hooks';
import { RecurringModeFormProps } from '../recurring-mode';
import { useState, useRef, useImperativeHandle, SyntheticEvent } from 'react';
import { DurationPicker } from 'components/DurationPicker';
import { formatMinutes } from 'utils';
import { IntervalAnchorPoint } from './enums';
import { IntervalModeFields } from './interval-recurring-mode';
import { getDefaultAnchorPoint } from './utils';

const DurationsConfigContainer = styled('div')({
  display: 'flex',
  gap: 'var(--space-always-xs, 8px)',
  marginBottom: 'var(--space-always-xs, 8px)',

  'wz-text-input': {
    minWidth: 'unset',

    '&.duration': {
      flex: 1,
    },
    '&.interval': {
      flex: 1,
    },
  },
});

export function IntervalConfigForm(props: RecurringModeFormProps) {
  const { t } = useTranslation();
  const [closureDuration, setClosureDuration] = useState<number>(
    typeof props.initialFieldValues?.closureDuration === 'number' ?
      props.initialFieldValues.closureDuration
    : NaN,
  );
  const closureDurationInputRef = useRef<HTMLInputElement>(null);
  const [intervalBetweenClosures, setIntervalBetweenClosures] =
    useState<number>(
      typeof props.initialFieldValues?.intervalBetweenClosures === 'number' ?
        props.initialFieldValues.intervalBetweenClosures
      : NaN,
    );
  const intervalBetweenClosuresInputRef = useRef<HTMLInputElement | null>(null);
  const [intervalAnchorPoint, setIntervalAnchorPoint] = useState(
    props.initialFieldValues?.anchorPoint ?? IntervalAnchorPoint.Default,
  );

  useImperativeHandle(
    props.fieldsValuesRef,
    () =>
      ({
        closureDuration,
        intervalBetweenClosures,
        anchorPoint: intervalAnchorPoint,
      }) as IntervalModeFields,
    [closureDuration, intervalAnchorPoint, intervalBetweenClosures],
  );

  props.setButtonState(
    'APPLY',
    !isNaN(closureDuration) && !isNaN(intervalBetweenClosures),
  );

  return (
    <div>
      <DurationsConfigContainer>
        <DurationPicker
          ref={closureDurationInputRef}
          className="duration"
          label={t('edit.closure.recurrence.interval.closure_duration_label')}
          value={closureDuration}
          onChange={setClosureDuration}
        />
        <DurationPicker
          ref={intervalBetweenClosuresInputRef}
          className="interval"
          label={t(
            'edit.closure.recurrence.interval.interval_between_closures_label',
          )}
          value={intervalBetweenClosures}
          onChange={setIntervalBetweenClosures}
        />
      </DurationsConfigContainer>

      <wz-select
        value={intervalAnchorPoint}
        onChange={(e: SyntheticEvent<HTMLSelectElement>) =>
          setIntervalAnchorPoint(e.currentTarget.value as IntervalAnchorPoint)
        }
        label={t('edit.closure.recurrence.interval.anchor_point_label')}
      >
        <wz-option value={IntervalAnchorPoint.Default}>
          {t('edit.closure.recurrence.interval.anchor_point_options.DEFAULT')}
        </wz-option>

        <wz-option
          value={IntervalAnchorPoint.StartOfPreviousClosure}
          disabled={closureDuration >= intervalBetweenClosures}
        >
          {t(
            'edit.closure.recurrence.interval.anchor_point_options.CLOSURE_START',
          )}
        </wz-option>

        <wz-option value={IntervalAnchorPoint.EndOfPreviousClosure}>
          {t(
            'edit.closure.recurrence.interval.anchor_point_options.CLOSURE_END',
          )}
        </wz-option>
      </wz-select>

      <wz-caption>
        {/* @i18n edit.closure.recurrence.interval.recurrence_explanation */}
        {/* @i18n-sub edit.closure.recurrence.interval.anchor_point_explanations */}
        {t('edit.closure.recurrence.interval.recurrence_explanation', {
          closureDuration:
            isFinite(closureDuration) ?
              formatMinutes(closureDuration)
            : `<${t('edit.closure.recurrence.interval.closure_duration_label')}>`,
          intervalBetweenClosures:
            isFinite(intervalBetweenClosures) ?
              formatMinutes(intervalBetweenClosures)
            : `<${t(
                'edit.closure.recurrence.interval.interval_between_closures_label',
              )}>`,
          anchorPoint: t(
            'edit.closure.recurrence.interval.anchor_point_explanations',
          )[
            normalizeAnchorPoint(
              intervalAnchorPoint,
              closureDuration,
              intervalBetweenClosures,
            )
          ],
        })}
      </wz-caption>
    </div>
  );
}

function normalizeAnchorPoint(
  anchorPoint: IntervalAnchorPoint,
  closureDuration: number,
  intervalBetweenClosures: number,
): IntervalAnchorPoint {
  if (anchorPoint === IntervalAnchorPoint.Default) {
    return getDefaultAnchorPoint(closureDuration, intervalBetweenClosures);
  }
  return anchorPoint;
}
