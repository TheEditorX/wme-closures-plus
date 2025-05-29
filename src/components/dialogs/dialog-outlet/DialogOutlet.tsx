/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentType,
  Ref,
  SyntheticEvent,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { WzDialog, WzDialogProps } from '../../WzDialog';
import { createSafePortal } from 'utils/create-safe-portal';
import { DialogDismissedError } from './errors';
import { DialogDismissReason } from './enums';
import {
  DialogLayoutButtonProps,
  DialogLayoutProps,
  ModalDialogLayoutProps,
} from './interfaces';
import { useSet } from 'hooks';
import { ModalDialogButtons } from './types';
// import { DialogLayoutRef } from './interfaces/dialog-layout-ref';

type DialogProps = Pick<
  WzDialogProps,
  'size' | 'alignment' | 'dismissible' | 'title'
>;

export interface DialogOutlet {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  showDialog<P extends ModalDialogLayoutProps<{}>>(
    layoutComponent: ComponentType<P>,
    layoutProps?: Omit<P, 'stateRef' | keyof DialogLayoutButtonProps<string>>,
    options?: {
      signal?: AbortSignal;
      dialogProps?: DialogProps;
      confirmButtonLabel?: string;
      cancelButtonLabel?: string;
      disabledButtons?: ModalDialogButtons[];
    },
  ): Promise<P extends DialogLayoutProps<infer S> ? S : never>;
}

export interface DialogOutletProps {
  ref?: Ref<DialogOutlet>;
}
export function DialogOutlet({ ref }: DialogOutletProps) {
  const [activeDialog, setActiveDialog] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Layout: ComponentType<DialogLayoutProps<{}>>;
    layoutProps: object;
    dialogProps: DialogProps;
    buttons: DialogButton[];
    onDismiss: (dialogState: any) => void;
  } | null>(null);
  // const activeLayoutRef = useRef<DialogLayoutRef>(null);
  const activeLayoutStateRef = useRef<any>(null);
  const disabledButtons = useSet<string>([]);

  const destructingButton = useCallback(
    (handler: (dialogState: any) => void) => {
      return (dialogState: any) => {
        handler(dialogState);
        setActiveDialog(null);
      };
    },
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      showDialog(layoutComponent, layoutProps = {} as any, options = {}) {
        return new Promise((resolve, reject) => {
          if (options.signal) {
            options.signal.addEventListener('abort', () => {
              reject(new DialogDismissedError(DialogDismissReason.Aborted));
              setActiveDialog(null);
            });
          }

          if (options.disabledButtons) {
            for (const button of options.disabledButtons) {
              disabledButtons.add(button);
            }
          }
          setActiveDialog({
            Layout: layoutComponent as any,
            layoutProps: layoutProps,
            dialogProps: options.dialogProps ?? {},
            buttons: [
              {
                id: 'APPLY',
                // @i18n-waze edit.apply
                label: options?.confirmButtonLabel ?? 'Apply',
                action: destructingButton((result) => resolve(result)),
              },
              {
                id: 'CANCEL',
                // @i18n-waze edit.cancel
                label: options?.cancelButtonLabel ?? 'Cancel',
                action: destructingButton(() =>
                  reject(new DialogDismissedError(DialogDismissReason.Button)),
                ),
              },
            ] satisfies DialogButton<ModalDialogButtons>[],
            onDismiss: () => {
              reject(new DialogDismissedError(DialogDismissReason.Native));
              setActiveDialog(null);
            },
          });
        });
      },
    }),
    [destructingButton, disabledButtons],
  );

  if (!activeDialog) return null;

  const renderButton = (button: DialogButton, buttonIndex: number) => {
    const handleClick = (event: SyntheticEvent<HTMLButtonElement>) => {
      event.currentTarget.blur();
      button.action(activeLayoutStateRef.current);
    };

    return (
      <wz-button
        key={button.id}
        onClick={handleClick}
        color={buttonIndex === 0 ? 'primary' : 'secondary'}
        disabled={disabledButtons.has(button.id)}
      >
        {button.label}
      </wz-button>
    );
  };

  return createSafePortal(
    <WzDialog
      {...activeDialog.dialogProps}
      controls={activeDialog.buttons.map(renderButton)}
      onHidden={activeDialog.onDismiss}
    >
      <activeDialog.Layout
        {...activeDialog.layoutProps}
        stateRef={activeLayoutStateRef}
        enableButton={(btnId) => disabledButtons.delete(btnId)}
        disableButton={(btnId) => disabledButtons.add(btnId)}
        getButtonState={(btnId) => disabledButtons.has(btnId)}
        setButtonState={(btnId, state) =>
          state ? disabledButtons.delete(btnId) : disabledButtons.add(btnId)
        }
      />
    </WzDialog>,
    document.getElementById('wz-dialog-container'),
  );
}

interface DialogButton<B extends string = string> {
  id: B;
  label: string;
  action(dialogState: any): void;
}
