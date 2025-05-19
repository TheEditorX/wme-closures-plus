import { createElement } from 'react';
import { useStepper } from '../StepperContext';

export function StepperContent() {
  const stepper = useStepper();

  if (!stepper.currentStepConfig) return null;

  if (typeof stepper.currentStepConfig.content !== 'function')
    return stepper.currentStepConfig.content;

  return createElement(stepper.currentStepConfig.content, {});
}
