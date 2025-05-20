import {
  ComponentProps,
  ComponentType,
  createElement,
  FunctionComponent,
  SyntheticEvent,
} from 'react';
import { StepperContextValue, useStepper } from '../StepperContext';

type ControlMethod = () => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KeyOf<O extends object, T = any> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

export function createContextControlButton(
  targetName: KeyOf<StepperContextValue, ControlMethod>,
  defaultLabel: string,
): ComponentType<Omit<ComponentProps<'wz-button'>, 'onClick'>> {
  const Component: FunctionComponent<
    Omit<ComponentProps<'wz-button'>, 'onClick'>
  > = (props) => {
    const stepper = useStepper();

    return createElement(
      'wz-button',
      Object.assign(
        {
          children: defaultLabel,
          onClick: (e: SyntheticEvent<HTMLButtonElement>) => {
            e.currentTarget.blur();
            stepper[targetName]();
          },
        },
        props,
      ),
    );
  };
  Component.displayName = `StepperControlButton(${targetName})`;

  return Component;
}
