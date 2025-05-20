import { createSafePortal } from '../../utils/create-safe-portal';
import { WzDialog, WzDialogProps } from '../WzDialog';
import { StepperActions, StepperContent } from './components';
import { StepperProvider, StepperProviderProps } from './StepperContext';
import { StepperIndicator } from './StepperIndicator';
import { StepId } from './types';

type ModalStepperProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends Record<StepId, any> = Record<StepId, any>,
> = Omit<
  StepperProviderProps<D> &
    Omit<WzDialogProps, 'ref' | 'onShown' | 'onHidden' | 'controls'>,
  'children'
>;
export function ModalStepper<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends Record<StepId, any> = Record<StepId, any>,
>(props: ModalStepperProps<D>) {
  return (
    <StepperProvider {...props}>
      {createSafePortal(
        <WzDialog
          {...props}
          controls={<StepperActions />}
          openOnMount
          onHidden={() => props.onCancelled?.()}
        >
          <StepperIndicator />

          <StepperContent />
        </WzDialog>,
        document.getElementById('wz-dialog-container'),
      )}
    </StepperProvider>
  );
}
