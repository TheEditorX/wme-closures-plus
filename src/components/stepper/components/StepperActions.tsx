import { PresetEditDialogData } from '../../closure-presets/preset-edit-dialog/interfaces';
import { useStepper } from '../StepperContext';
import { StepperActionButton } from './StepperActionButton';

export function StepperActions() {
  const { currentStepConfig, getStepData } = useStepper<PresetEditDialogData>();

  if (!currentStepConfig?.actions) return null;

  if (typeof currentStepConfig.actions === 'function') {
    return currentStepConfig.actions(
      getStepData(currentStepConfig.id) as Parameters<
        typeof currentStepConfig.actions
      >[0],
    );
  }

  return currentStepConfig.actions.map((action) => (
    <StepperActionButton
      key={action.id?.toString() || action.label}
      action={action}
    />
  ));
}
