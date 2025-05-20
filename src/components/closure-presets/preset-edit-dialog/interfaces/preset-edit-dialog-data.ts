import { Weekday } from '../../../../enums';
import {
  STEP_CLOSURE_DETAILS_SYMBOL,
  STEP_PRESET_INFO_SYMBOL,
} from '../consts';

export type PresetEditDialogData = {
  [S in typeof STEP_PRESET_INFO_SYMBOL]: {
    name: string;
    description: string;
  };
} & {
  [S in typeof STEP_CLOSURE_DETAILS_SYMBOL]: {
    description?: string;
    startDate:
      | null
      | { type: 'CURRENT_DAY' }
      | { type: 'DAY_OF_WEEK'; value: Weekday };
    startTime: string;
    endTime:
      | null
      | {
          type: 'FIXED';
          value: string;
        }
      | {
          type: 'DURATIONAL';
          duration: number;
        };
  };
};
