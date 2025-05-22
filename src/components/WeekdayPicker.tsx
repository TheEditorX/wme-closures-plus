import { Toggle, ToggleGroup } from '@base-ui-components/react';
import { cx } from '@emotion/css';
import styled from '@emotion/styled';
import { WeekdayFlags } from '../enums'; // Assuming WeekdayFlags is imported
import { createBlurrableHandler } from '../utils';
import { WeekdayPickerLabel } from './WeekdayPickerLabel'; // For React.ReactNode

const ALL_WEEKDAY_KEYS = WeekdayFlags.getBasicFlagKeys();

const ToggleButton = styled('button')({
  minWidth: 40,
  minHeight: 40,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  fontFamily: '"Waze Boing", "Waze Boing HB", "Rubik", sans-serif',
  fontWeight: 500,

  color: 'var(--cp_toggle_button_color, var(--content_default, #202124))',
  backgroundColor: 'transparent',
  border: '1px solid var(--cp_toggle_button_border, var(--hairline, #d5d7db))',

  '&:hover': {
    backgroundColor:
      'rgb(from var(--cp_toggle_button_color, var(--content_default, #202124)) r g b / 0.04)',
  },
  '&:active': {
    backgroundColor:
      'rgb(from var(--cp_toggle_button_color, var(--content_default, #202124)) r g b / 0.1)',
  },

  '&.selected': {
    backgroundColor:
      'rgb(from var(--cp_toggle_button_selected_color, var(--primary_variant, #0075e3)) r g b / 0.1)',
    borderColor:
      'var(--cp_toggle_button_selected_border, var(--primary, #0075e3))',
    color: 'var(--cp_toggle_button_selected_color, var(--primary, #0075e3))',

    '&:hover': {
      backgroundColor:
        'rgb(from var(--cp_toggle_button_selected_color, var(--primary_variant, #0075e3)) r g b / 0.14)',
    },
    '&:active': {
      backgroundColor:
        'rgb(from var(--cp_toggle_button_selected_color, var(--primary_variant, #0075e3)) r g b / 0.2)',
    },
  },
});

interface CommonWeekdayPickerProps {
  /** Optional label for the picker */
  label?: string;
  /**
   * Optional flag to disable the picker.
   * @default false
   */
  disabled?: boolean;
  /** Sets the selected days by default */
  defaultValue?: InstanceType<typeof WeekdayFlags>;
  /**
   * The currently selected weekday(s).
   * Should be a valid bitwise combination of values from `WeekdayFlags`.
   */
  value?: InstanceType<typeof WeekdayFlags>;
  /**
   * Callback function invoked when the selected weekday changes.
   * @param day - The newly selected weekday(s) (or undefined if deselected and {@link SingleWeekdayPickerProps.allowDeselect allowDeselect} is true),
   *              a value from `WeekdayFlags`.
   */
  onChange?(day: InstanceType<typeof WeekdayFlags>): void;
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

      <ToggleGroup
        toggleMultiple={props.allowMultiple}
        defaultValue={props.defaultValue?.getActiveBasicFlags()}
        value={props.value?.getActiveBasicFlags()}
        onValueChange={
          props.onChange ?
            (groupValue) => {
              props.onChange(
                new WeekdayFlags(
                  groupValue.reduce((acc, flag) => acc | flag, 0),
                ),
              );
            }
          : undefined
        }
        style={{
          display: 'flex',
          gap: 'var(--space-always-xxxs, 2px)',
        }}
      >
        {ALL_WEEKDAY_KEYS.map((day) => (
          <Toggle
            key={day}
            value={WeekdayFlags[day].getValue().toString()}
            render={(props, state) => (
              <ToggleButton
                {...props}
                className={cx(state.pressed && 'selected')}
              >
                {day[0]}
              </ToggleButton>
            )}
          />
        ))}
      </ToggleGroup>
    </div>
  );
}
