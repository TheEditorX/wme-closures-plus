import { ActionConfig } from '../interfaces';

interface StepperActionButtonProps {
  action: ActionConfig;
}
export function StepperActionButton({ action }: StepperActionButtonProps) {
  return (
    <wz-button
      onClick={action.onClick}
      variant={action.variant || 'primary'}
      disabled={
        typeof action.disabled === 'boolean' ?
          action.disabled
        : action.disabled()
      }
    >
      {action.label}
    </wz-button>
  );
}
