import { SerializedDateResolver } from 'consts/date-resolvers';

interface ClosureFixedEnd {
  type: 'FIXED';
  time: {
    hours: number;
    minutes: number;
  };
  postponeBy: number;
}
interface ClosureDurationalEnd {
  type: 'DURATIONAL';
  duration: {
    hours: number;
    minutes: number;
  };
  roundTo?: 10 | 15 | 30 | 60; // round to nearest X minutes
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
