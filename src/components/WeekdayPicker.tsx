import { Toggle, ToggleGroup } from '@base-ui-components/react';
import { css, cx } from '@emotion/css';
import styled from '@emotion/styled';
import { WeekdayFlags } from '../enums';
import { createBlurrableHandler } from '../utils';
import { ToggleButton } from './ToggleButton';
import { WeekdayPickerLabel } from './WeekdayPickerLabel';

const ALL_WEEKDAY_KEYS = WeekdayFlags.getBasicFlagKeys();

const RoundedToggleButton = styled(ToggleButton)({
  borderRadius: '100px',
});

const rootClass = css({
  display: 'flex',
  gap: 'var(--space-always-xxs, 4px)',
});
const rootFullWidthClass = css({
  width: '100%',

  '& > *': {
    flex: 1,
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

  /** Optional flag to make the picker span the full width of its container. */
  fullWidth?: boolean;
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
              if (
                !groupValue &&
                isSingleSelectMode(props) &&
                !props.allowDeselect
              )
                return;

              props.onChange(
                new WeekdayFlags(
                  groupValue.reduce((acc, flag) => acc | flag, 0),
                ),
              );
            }
          : undefined
        }
        className={cx(rootClass, props.fullWidth && rootFullWidthClass)}
      >
        {ALL_WEEKDAY_KEYS.map((day) => (
          <Toggle
            key={day}
            value={WeekdayFlags[day].getValue().toString()}
            render={(toggleProps, state) => (
              <RoundedToggleButton
                {...toggleProps}
                className={cx(state.pressed && 'selected')}
              >
                {props.fullWidth ? day.substring(0, 3) : day[0]}
              </RoundedToggleButton>
            )}
          />
        ))}
      </ToggleGroup>
    </div>
  );
}

function isSingleSelectMode(
  props: WeekdayPickerProps,
): props is SingleWeekdayPickerProps {
  return !props.allowMultiple;
}
