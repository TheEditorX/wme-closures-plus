import { WazeDirection } from 'enums';

export interface ClosureEditorForm {
  getDescription(): string;
  setDescription(description: string): void;

  getDirection(): WazeDirection;
  setDirection(direction: WazeDirection): void;

  getStart(): Date;
  setStart(start: Date): void;

  getEnd(): Date;
  setEnd(end: Date): void;

  getEventId(): string | null;
  setEventId(eventId: string | null): void;

  getIsPermanent(): boolean;
  setIsPermanent(permanent: boolean): void;

  canEditProvider(): boolean;
  getProvider(): string | null;
  setProvider(provider: string | null): void;
  getAvailableProviders(): string[];
}
