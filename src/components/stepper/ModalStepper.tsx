import { createSafePortal } from '../../utils/create-safe-portal';
import { WzDialog, WzDialogProps } from '../WzDialog';
import { StepperActions, StepperContent } from './components';
import { StepperProvider, StepperProviderProps } from './StepperContext';
import { StepperIndicator } from './StepperIndicator';

type ModalStepperProps = StepperProviderProps & Omit<WzDialogProps, 'ref'>;
export function ModalStepper(props: ModalStepperProps) {
  return (
    <StepperProvider {...props}>
      {createSafePortal(
        <WzDialog {...props} controls={<StepperActions />}>
          <StepperIndicator />

          <StepperContent />
        </WzDialog>,
        document.getElementById('wz-dialog-container'),
      )}
    </StepperProvider>
  );
}
