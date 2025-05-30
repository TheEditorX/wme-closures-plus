import { DialogOutlet, ReccuringClosureConfigDialog } from 'components/dialogs';
import { DialogDismissedError } from 'components/dialogs/dialog-outlet';
import { SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import { catchError } from 'utils';
import { createSafePortal } from 'utils/create-safe-portal';
import { css, cx } from '@emotion/css';
import { SelectedRecurringMode } from 'components/dialogs/reccuring-closure-config-dialog/interfaces';
import { useEventListener } from 'usehooks-ts';
import { useWmeSdk } from 'contexts/WmeSdkContext';
import { useTranslation } from '../../../hooks';

const formGroupClass = css({
  display: 'flex',

  '& > wz-checkbox': {
    flex: 1,
  },
});

export interface RecurringClosureProps {
  closureEditPanel: Element;
}
export function RecurringClosure({ closureEditPanel }: RecurringClosureProps) {
  const { t } = useTranslation();
  const dialogOutletRef = useRef<DialogOutlet>(null);
  const recurringClosureFormGroup = useMemo(() => {
    const newFormGroup = document.createElement('div');
    newFormGroup.className = cx('form-group', formGroupClass);
    return newFormGroup;
  }, []);
  useEffect(() => {
    const endDateElement = closureEditPanel.querySelector(
      '.form-group.end-date-form-group',
    );
    endDateElement.after(recurringClosureFormGroup);

    return () => {
      recurringClosureFormGroup.remove();
    };
  }, [closureEditPanel, recurringClosureFormGroup]);

  const [isEnabled, setIsEnabled] = useState(false);
  const [config, setConfig] = useState<SelectedRecurringMode | null>(null);

  const showConfigDialog = async () => {
    const [dismissReason, result] = await catchError(
      dialogOutletRef.current.showDialog(
        ReccuringClosureConfigDialog,
        {
          initialMode: config?.id,
          initialFieldValues: config?.fields,
        },
        {
          dialogProps: {
            title: t('edit.closure.recurrence.set_rules_btn'),
          },
          disabledButtons: ['APPLY'],
        },
      ),
      [DialogDismissedError],
    );

    if (dismissReason) return;

    setIsEnabled(true);
    setConfig(result.getRecurringMode());
  };

  const handleCheckboxChanged = (event: SyntheticEvent<HTMLInputElement>) => {
    const checkbox = event.currentTarget;

    if (checkbox.checked) {
      if (!config) {
        event.preventDefault();
        showConfigDialog();
      }
    }

    if (!event.isDefaultPrevented()) {
      setIsEnabled(checkbox.checked);
    } else {
      checkbox.checked = !checkbox.checked;
    }
  };

  const handleButtonClick = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    showConfigDialog();
  };

  const nativeSaveButton = useMemo(() => {
    return closureEditPanel.querySelector(
      'wz-button[type=submit]',
    ) as HTMLButtonElement | null;
  }, [closureEditPanel]);
  useSaveButtonInterceptor(nativeSaveButton, (closures) => {
    if (!config || !isEnabled) return closures;

    return closures.flatMap((closure) => {
      const { timeframes: targetTimeframes } = config.calculateClosureTimes({
        startDate: closure.startDate,
        endDate: closure.endDate,
      });
      return targetTimeframes.map((timeframe) => {
        return {
          ...closure,
          startDate: timeframe.startDate,
          endDate: timeframe.endDate,
        };
      });
    });
  });

  return createSafePortal(
    <>
      <wz-checkbox
        checked={isEnabled && config}
        onChange={handleCheckboxChanged}
      >
        {t('edit.closure.recurrence.enable_checkbox')}
      </wz-checkbox>

      <wz-button
        color="text"
        size="sm"
        disabled={!isEnabled || !config}
        onClick={handleButtonClick}
      >
        {t('common.change')}
      </wz-button>

      <DialogOutlet ref={dialogOutletRef} />
    </>,
    recurringClosureFormGroup,
  );
}

function useSaveButtonInterceptor(
  saveButtonElement: HTMLButtonElement | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modifyClosures: (roadClosuresAttributes: any[]) => any[],
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wmeSdk: any = useWmeSdk();
  useEventListener(
    'pointerdown',
    () => {
      const unregister = wmeSdk.Events.registerMiddleware(
        'closures.save',
        (context, next) => {
          (() => {
            if (!modifyClosures) return;

            const modifiedClosures = modifyClosures(context.data.closures);
            // modified closures might include duplicate ids if a single closure have been updated with recurring closures
            // ensure we catch this case and only preserve the id for the first closure, and add extra closures
            const seenIds = new Set(); // Keep track of IDs we've already encountered
            for (const closure of modifiedClosures) {
              // Check if the closure has an ID and if we've seen it before
              if (closure.id != null) {
                // Use != null to catch both null and undefined
                if (seenIds.has(closure.id)) {
                  // Duplicate ID found, set it to null
                  closure.id = null;
                  continue;
                }

                // First time seeing this ID, add it to the set
                seenIds.add(closure.id);
              }
            }
            context.data.closures = modifiedClosures;
          })();
          next();
          unregister();
        },
      );
      setTimeout(() => {
        unregister();
      }, 1000);
    },
    { current: saveButtonElement },
  );
}
