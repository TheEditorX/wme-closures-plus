import { WeekdayFlags } from '../enums'; // Assuming WeekdayFlags is imported
import React, { SyntheticEvent, useCallback, useMemo } from 'react';
import { createBlurrableHandler } from '../utils';
import { WeekdayPickerLabel } from './WeekdayPickerLabel'; // For React.ReactNode

const ALL_WEEKDAY_KEYS = WeekdayFlags.getBasicFlagKeys();

interface CommonWeekdayPickerProps {
  /** Optional label for the picker */
  label?: string;
  /**
   * Optional flag to disable the picker.
   * @default false
   */
  disabled?: boolean;
  /**
   * The currently selected weekday(s).
   * Should be a valid bitwise combination of values from `WeekdayFlags`.
   */
  value: InstanceType<typeof WeekdayFlags>;
  /**
   * Callback function invoked when the selected weekday changes.
   * @param day - The newly selected weekday(s) (or undefined if deselected and {@link SingleWeekdayPickerProps.allowDeselect allowDeselect} is true),
   *              a value from `WeekdayFlags`.
   */
  onChange(day: InstanceType<typeof WeekdayFlags>): void;
  /**
   * Optional flag to make the picker read-only.
   * @default false
   */
  readOnly?: boolean;
}
interface SingleWeekdayPickerProps extends CommonWeekdayPickerProps {
  /**
   * Specifies that only a single weekday can be selected.
   * When undefined or false, it implies single selection mode.
   */
  allowMultiple?: false;
  /**
   * In single selection mode, allows deselecting the currently selected day by clicking it again.
   * @default false
   */
  allowDeselect?: boolean;
}
interface MultipleWeekdayPickerProps extends CommonWeekdayPickerProps {
  /** Specifies that multiple weekdays can be selected. Must be true for multi-select mode. */
  allowMultiple: true;
  /**
   * Optional flag to display "Select all" and "Deselect all" buttons.
   * Applicable only when `allowMultiple` is true.
   * @default false
   */
  showSelectButtons?: boolean;
}
export type WeekdayPickerProps =
  | SingleWeekdayPickerProps
  | MultipleWeekdayPickerProps;

export function WeekdayPicker(props: WeekdayPickerProps) {
  const createHandlerSelect = useCallback(
    (day: ReturnType<typeof WeekdayFlags.getBasicFlagKeys>[number]) => {
      const dayValue = WeekdayFlags[day];
      return (e: SyntheticEvent<HTMLElement & { checked: boolean }>) => {
        if (props.disabled || props.readOnly) return;

        if (props.allowMultiple) {
          const newValue =
            e.currentTarget.checked ?
              props.value.set(dayValue)
            : props.value.clear(dayValue);
          props.onChange(newValue);
        } else {
          let newValue = props.value.reset();
          if (e.currentTarget.checked) newValue = newValue.set(dayValue);
          props.onChange(newValue);
        }
      };
    },
    [props],
  );

  const renderDayInput = useCallback(
    (day: (typeof ALL_WEEKDAY_KEYS)[number]) => {
      if (props.allowMultiple) {
        return (
          <wz-checkbox
            key={day}
            checked={props.value[day]}
            disabled={props.disabled || props.readOnly}
            onChange={createHandlerSelect(day)}
          >
            {day}
          </wz-checkbox>
        );
      } else {
        return (
          <wz-radio-button
            key={day}
            checked={props.value[day]}
            disabled={props.disabled || props.readOnly}
            onChange={createHandlerSelect(day)}
          >
            {day}
          </wz-radio-button>
        );
      }
    },
    [
      createHandlerSelect,
      props.allowMultiple,
      props.disabled,
      props.readOnly,
      props.value,
    ],
  );

  const allDayElements = useMemo(() => {
    return ALL_WEEKDAY_KEYS.map((day) => renderDayInput(day));
  }, [renderDayInput]);

  return (
    <div>
      {props.label && (
        <WeekdayPickerLabel
          label={props.label}
          actions={
            props.allowMultiple &&
            props.showSelectButtons && (
              <>
                <wz-button
                  color="text"
                  size="xs"
                  onClick={createBlurrableHandler(() =>
                    props.onChange(WeekdayFlags.All),
                  )}
                >
                  Select all
                </wz-button>
                <wz-button
                  color="text"
                  size="xs"
                  onClick={createBlurrableHandler(() =>
                    props.onChange(WeekdayFlags.None),
                  )}
                >
                  Select none
                </wz-button>
              </>
            )
          }
        />
      )}

      {!props.allowMultiple ?
        <wz-radio-group
          style={{ '--wz-radio-button-margin': 0 }}
          layout="vertical"
        >
          {allDayElements}
        </wz-radio-group>
      : allDayElements}
    </div>
  );
}
