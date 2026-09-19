import { BaseHookValue } from './base-hook-value';

export interface UseSyncExternalStoreQueue<T = unknown> {
  value: T;
  getSnapshot: () => T;
}

export interface UseSyncExternalStoreHookValue<T = unknown>
  extends BaseHookValue {
  memoizedState: T;
  queue: UseSyncExternalStoreQueue<T>;
}

/**
 * Checks if the given hook value (memoizedState of a Fiber) is a result of a useSyncExternalStore hook.
 * @param hookValue The hook value to check.
 * @returns True if the hook value is a useSyncExternalStore hook value, false otherwise.
 */
export function isUseSyncExternalStore<T = unknown>(
  hookValue: unknown,
): hookValue is UseSyncExternalStoreHookValue<T> {
  return (
    typeof hookValue === 'object' &&
    hookValue !== null &&
    'memoizedState' in hookValue &&
    'queue' in hookValue &&
    hookValue.queue !== null &&
    typeof hookValue.queue === 'object' &&
    'getSnapshot' in hookValue.queue &&
    typeof (hookValue.queue as Record<string, unknown>).getSnapshot ===
      'function' &&
    'value' in hookValue.queue
  );
}
