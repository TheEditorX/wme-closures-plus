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
  roundUpTo?: number; // in minutes: 10, 15, 30, 60
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
