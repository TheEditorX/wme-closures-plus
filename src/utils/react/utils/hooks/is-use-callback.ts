import { DependencyList } from 'react';
import { BaseHookValue } from './base-hook-value';
import { isUseMemo } from './is-use-memo';

export interface UseCallbackHookValue<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => any = (...args: any[]) => any,
> extends BaseHookValue {
  memoizedState: [T, DependencyList];
  queue: null;
}

/**
 * Checks if the given hook value (memoizedState of a Fiber) is a result of a useCallback hook.
 * @param hookValue The hook value to check.
 * @returns True if the hook value is a useCallback hook value, false otherwise.
 */
export function isUseCallback<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => any = (...args: any[]) => any,
>(hookValue: unknown): hookValue is UseCallbackHookValue<T> {
  return (
    isUseMemo(hookValue) && typeof hookValue.memoizedState[0] === 'function'
  );
}
