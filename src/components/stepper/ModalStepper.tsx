import { createSafePortal } from '../../utils/create-safe-portal';
import { WzDialog, WzDialogProps } from '../WzDialog';
import { StepperActions, StepperContent } from './components';
import { StepperProvider, StepperProviderProps } from './StepperContext';
import { StepperIndicator } from './StepperIndicator';

type ModalStepperProps = StepperProviderProps &
  Omit<WzDialogProps, 'ref' | 'onShown' | 'onHidden'>;
export function ModalStepper(props: ModalStepperProps) {
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
