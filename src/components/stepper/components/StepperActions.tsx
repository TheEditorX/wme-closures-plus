import { useStepper } from '../StepperContext';
import { StepperActionButton } from './StepperActionButton';

export function StepperActions() {
  const { currentStepConfig } = useStepper();

  if (!currentStepConfig?.actions) return null;

  if (typeof currentStepConfig.actions === 'function')
    return currentStepConfig.actions();

  return currentStepConfig.actions.map((action) => (
    <StepperActionButton
      key={action.id?.toString() || action.label}
      action={action}
    />
  ));
}
