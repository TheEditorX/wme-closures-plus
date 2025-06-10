import { TimeOnly } from '../../../../classes';
import { WeekdayFlags } from '../../../../enums';
import {
  STEP_CLOSURE_DETAILS_SYMBOL,
  STEP_PRESET_INFO_SYMBOL,
  STEP_SUMMARY_SYMBOL,
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
      | { type: 'CURRENT_DATE' }
      | { type: 'DAY_OF_WEEK'; value: InstanceType<typeof WeekdayFlags> };
    startTime?: TimeOnly;
    endTime:
      | null
      | {
          type: 'FIXED';
          value: TimeOnly;
          postponeBy: number;
        }
      | {
          type: 'DURATIONAL';
          duration: number;
          roundUpTo?: number;
        };
  };
} & {
  [S in typeof STEP_SUMMARY_SYMBOL]: never;
};
