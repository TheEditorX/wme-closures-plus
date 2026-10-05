import {
  createElement,
  createRef,
  RefObject,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { TabActiveEvent, WzTabs } from '../../WzTabs';
import { WzTab } from '../../WzTab';
import { DialogLayoutProps } from '../dialog-outlet';
import { RecurringMode } from './recurring-modes';
import { allRecurringModes } from './recurring-modes';
import { Timeframe } from 'interfaces';
import { SelectedRecurringMode } from './interfaces';

interface ReccuringClosureConfigDialogResult {
  getRecurringMode(): SelectedRecurringMode;
}

interface RecurringClosureConfigDialogProps
  extends DialogLayoutProps<ReccuringClosureConfigDialogResult> {
  recurringModes?: RecurringMode[];
  initialMode?: string;
  initialFieldValues?: FieldsValuesMap;
}

type FieldsValuesMap = Record<string, string | number>;
type FieldsValuesRef = RefObject<FieldsValuesMap>;

export function ReccuringClosureConfigDialog({
  recurringModes = allRecurringModes,
  enableButton,
  disableButton,
  setButtonState,
  getButtonState,
  ...props
}: RecurringClosureConfigDialogProps) {
  const modeSelectionTabsRef = useRef<WzTabs>(null);
  const fieldsValuesRef = useRef<Record<string, FieldsValuesRef>>({});
  const [activeModeId, setActiveModeId] = useState<string>(
    props.initialMode ?? 'DAILY',
  );

  useImperativeHandle(
    props.stateRef,
    () =>
      ({
        getRecurringMode() {
          const mode = recurringModes.find((mode) => mode.id === activeModeId);
          if (!mode) return null;

          return {
            ...mode,
            id: activeModeId,
            fields: fieldsValuesRef.current[activeModeId].current,
            calculateClosureTimes: (timeframe: Timeframe) => {
              return mode.calculateClosureTimes({
                timeframe,
                fieldsValues: fieldsValuesRef.current[activeModeId].current,
              });
            },
          };
        },
      }) as const,
    [activeModeId, recurringModes],
  );

  const handleTabActive = (event: TabActiveEvent) => {
    setActiveModeId(event.detail.tabId ?? null);
  };

  return (
    <>
      <wz-body2>
        Define how this closure should repeat within the selected dates and
        times
      </wz-body2>

      <WzTabs
        ref={modeSelectionTabsRef}
        fixed
        style={{ marginTop: 8 }}
        onTabActive={handleTabActive}
        activeTabId={activeModeId}
      >
        {recurringModes.map((recurringMode) => {
          const fieldsValuesMap =
            fieldsValuesRef.current[recurringMode.id] ||
            (() => {
              const ref = createRef<FieldsValuesMap>();
              if (props.initialMode === recurringMode.id)
                ref.current = props.initialFieldValues;
              return ref;
            })();

          fieldsValuesRef.current[recurringMode.id] = fieldsValuesMap;
          return (
            <WzTab
              key={recurringMode.id}
              id={recurringMode.id}
              label={recurringMode.name}
              disabled={!!recurringMode.disabledReason}
              tooltip={recurringMode.disabledReason}
            >
              {recurringMode.formComponent &&
                createElement(recurringMode.formComponent, {
                  fieldsValuesRef: (instance) => {
                    if (!instance) return;
                    fieldsValuesRef.current[recurringMode.id].current =
                      instance;
                  },
                  enableButton: (...args) =>
                    activeModeId === recurringMode.id && enableButton(...args),
                  disableButton: (...args) =>
                    activeModeId === recurringMode.id && disableButton(...args),
                  getButtonState: (...args) =>
                    activeModeId === recurringMode.id &&
                    getButtonState(...args),
                  setButtonState: (...args) =>
                    activeModeId === recurringMode.id &&
                    setButtonState(...args),
                  initialFieldValues:
                    recurringMode.id === props.initialMode ?
                      props.initialFieldValues
                    : undefined,
                })}
            </WzTab>
          );
        })}
      </WzTabs>
    </>
  );
}
