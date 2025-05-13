import { ComponentProps } from 'react';
import { ActionId } from '../types';

export interface ActionConfig {
  id: ActionId;
  label: string;
  onClick: () => void;
  disabled?: boolean | (() => boolean);
  variant?: ComponentProps<'wz-button'>['variant'];
}
