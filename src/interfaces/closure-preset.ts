import { SerializedDateResolver } from 'consts/date-resolvers';

interface ClosureFixedEnd {
  type: 'FIXED';
  time: {
    hours: number;
    minutes: number;
  };
  postponeBy: number;
  roundTo?: 'NONE' | '10_MINUTES' | '15_MINUTES' | '30_MINUTES' | '1_HOUR';
}
interface ClosureDurationalEnd {
  type: 'DURATIONAL';
  duration: {
    hours: number;
    minutes: number;
  };
  roundTo?: 'NONE' | '10_MINUTES' | '15_MINUTES' | '30_MINUTES' | '1_HOUR';
}

export interface ClosurePresetMetadata {
  id: number;
  createdAt: string;
  updatedAt: string;
}
export interface ClosurePreset extends ClosurePresetMetadata {
  name: string;
  description?: string;
  closureDetails: {
    description?: string;
    startDate: SerializedDateResolver;
    startTime?: {
      hours: number;
      minutes: number;
    };
    end: ClosureFixedEnd | ClosureDurationalEnd;
  };
}
