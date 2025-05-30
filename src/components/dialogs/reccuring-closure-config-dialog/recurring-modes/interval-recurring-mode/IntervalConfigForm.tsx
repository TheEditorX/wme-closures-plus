import styled from '@emotion/styled';
import { RecurringModeFormProps } from '../recurring-mode';
import { useState, useRef, useImperativeHandle, SyntheticEvent } from 'react';
import { DurationPicker } from 'components/DurationPicker';
import { formatMinutes, createFocusHandler } from 'utils';
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
          // @i18n edit.closure_recurrence.interval.closure_duration_label 
          label="Closure duration"
          value={closureDuration}
          onChange={setClosureDuration}
        />
        <DurationPicker
          ref={intervalBetweenClosuresInputRef}
          className="interval"
          // @i18n edit.closure_recurrence.interval.interval_between_closures_label 
          label="Interval between closures"
          value={intervalBetweenClosures}
          onChange={setIntervalBetweenClosures}
        />
      </DurationsConfigContainer>

      <wz-select
        value={intervalAnchorPoint}
        onChange={(e: SyntheticEvent<HTMLSelectElement>) =>
          setIntervalAnchorPoint(e.currentTarget.value as IntervalAnchorPoint)
        }
        // @i18n edit.closure_recurrence.interval.anchor_point_label 
        label="Base next repeat on…"
      >
        <wz-option value={IntervalAnchorPoint.Default}>
          {/* @i18n edit.closure_recurrence.interval.anchor_point_options.DEFAULT */}
          Let Closures+ decide it
        </wz-option>

        <wz-option
          value={IntervalAnchorPoint.StartOfPreviousClosure}
          disabled={closureDuration >= intervalBetweenClosures}
        >
          {/* @i18n edit.closure_recurrence.interval.anchor_point_options.CLOSURE_START */}
          Start of previous closure
        </wz-option>

        <wz-option value={IntervalAnchorPoint.EndOfPreviousClosure}>
          {/* @i18n edit.closure_recurrence.interval.anchor_point_options.CLOSURE_END */}
          End of previous closure
        </wz-option>
      </wz-select>

      <wz-caption>
        {/* @i18n edit.closure_recurrence.interval.recurrence_explanation */}
        {/* @i18n-sub edit.closure_recurrence.interval.anchor_point_explanations */}
        Creates multiple closures, each lasting{' '}
        <b>
          {isFinite(closureDuration) ?
            formatMinutes(closureDuration)
          : <wz-a onClick={createFocusHandler(closureDurationInputRef)}>
              {'<Closure duration>'}
            </wz-a>
          }
        </b>
        , starting every{' '}
        <b>
          {isFinite(intervalBetweenClosures) ?
            formatMinutes(intervalBetweenClosures)
          : <wz-a onClick={createFocusHandler(intervalBetweenClosuresInputRef)}>
              {'<Interval between closures>'}
            </wz-a>
          }
        </b>{' '}
        {formatAnchorPointLabel(
          intervalAnchorPoint,
          closureDuration,
          intervalBetweenClosures,
        )}
        , within the overall start and end times.
      </wz-caption>
    </div>
  );
}

function formatAnchorPointLabel(
  anchorPoint: IntervalAnchorPoint,
  closureDuration: number,
  intervalBetweenClosures: number,
): string {
  if (anchorPoint === IntervalAnchorPoint.Default) {
    anchorPoint = getDefaultAnchorPoint(
      closureDuration,
      intervalBetweenClosures,
    );
  }

  switch (anchorPoint) {
    case IntervalAnchorPoint.StartOfPreviousClosure:
      return 'from the start of the previous closure';
    case IntervalAnchorPoint.EndOfPreviousClosure:
      return 'from the end of the previous closure';
    default:
      return 'whenever Closures+ decides';
  }
}
