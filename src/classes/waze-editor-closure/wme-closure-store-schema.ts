import { WazeDirection } from 'enums';

export interface WmeActiveClosure {
  reason: string;
  direction: WazeDirection;
  startDate: string;
  endDate: string;
  eventId: string | null;
  permanent: boolean;
  provider: string | null;
  externalProvider?: string | null;
  externalProviderId?: string | null;
  providerIncidentId?: string | null;
  closuresType?: string;
  createdBy?: number | null;
  fromSegForward?: boolean;
  toSegForward?: boolean;
  partial?: boolean;
  segments?: unknown[];
  closures?: unknown[];
  reverseSegments?: Record<string, unknown>;
  attributions?: unknown[];
}

export interface WmeClosureStoreState {
  _legacyCid?: string;
  isNew: boolean;
  activeClosure: WmeActiveClosure;
  originalClosure?: WmeActiveClosure;
  closureNodes?: unknown[];
  validationErrors?: Record<string, unknown>;
  updateAttribute(attributeName: string, value: unknown): void;
  validateSession?(): boolean;
  setNodeClosed?(nodeId: number, isClosed: boolean): void;
  setAllNodesClosed?(isClosed: boolean): void;
  initClosureSession?(): void;
  reset?(): void;
  resetSession?(): void;
}

/**
 * Type guard validating that an object matches the WME Closure Zustand Store schema.
 */
export function isWmeClosureStoreState(
  state: unknown,
): state is WmeClosureStoreState {
  return (
    typeof state === 'object' &&
    state !== null &&
    'activeClosure' in state &&
    typeof (state as WmeClosureStoreState).activeClosure === 'object' &&
    (state as WmeClosureStoreState).activeClosure !== null &&
    typeof (state as WmeClosureStoreState).updateAttribute === 'function'
  );
}
