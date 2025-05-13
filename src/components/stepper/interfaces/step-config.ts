import { ComponentType, ReactElement, ReactNode } from 'react';
import { StepId } from '../types';
import { ActionConfig } from './action-config';
import { IconDetail } from './icon-detail';
import { StepContentProps } from './step-content-props';

export interface StepConfig {
  /** Unique ID for the step, used for data storage */
  id: StepId;

  title: string;
  description?: string;

  /** For the indicator, could be string for Waze font icon class, or a component to render as the icon */
  icon?: string | IconDetail | ReactElement;

  /** The main content of the step */
  content: ReactNode | ComponentType<StepContentProps>;

  /** Called when the step becomes active */
  onEnter?: () => void;

  /** Called before leaving. Return false to prevent. */
  onLeave?: () => void | boolean | Promise<void | boolean>;

  actions?: ActionConfig[] | (() => ReactNode);

  nextButtonLabel?: string;
  prevButtonLabel?: string;
}
