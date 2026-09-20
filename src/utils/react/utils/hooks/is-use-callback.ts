import { DependencyList } from 'react';
import { BaseHookValue } from './base-hook-value';

export interface UseCallbackHookValue<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => any = (...args: any[]) => any,
> extends BaseHookValue {
  memoizedState: [T, DependencyList];
  queue: null;
}

/**
 * Checks if the given hook value (memoizedState of a Fiber) is a result of a useCallback hook.
 * React stores useCallback and function-valued useMemo hooks in the same tuple
 * shape, so a Fiber hook value alone cannot distinguish between them.
 * @param hookValue The hook value to check.
 * @returns Always false because no structural distinction is available.
 */
export function isUseCallback<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => any = (...args: any[]) => any,
>(hookValue: unknown): hookValue is UseCallbackHookValue<T> {
  void hookValue;
  return false;
}
