import type { StoreApi } from 'zustand';
import type { AnyHook } from '../parse-fiber-hooks';
import type { CompositeHookMatcher } from './composite-hook';

export interface ZustandUseStoreHook<TState = unknown, TSlice = unknown> {
  type: 'zustand:useStore';
  store: ReadonlyStoreApi<TState>;
  selector: (state: TState) => TSlice;
  cachedValue: TSlice;
}

export type ReadonlyStoreApi<T> = Pick<
  StoreApi<T>,
  'getState' | 'getInitialState' | 'subscribe'
>;

/**
 * Type guard checking whether a given value adheres to the Zustand `StoreApi` contract in Readonly.
 */
export function isReadonlyStoreApi<T = unknown>(
  value: unknown,
): value is ReadonlyStoreApi<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'getState' in value &&
    typeof (value as Record<string, unknown>).getState === 'function' &&
    'getInitialState' in value &&
    typeof (value as Record<string, unknown>).getInitialState === 'function' &&
    'subscribe' in value &&
    typeof (value as Record<string, unknown>).subscribe === 'function'
  );
}

/**
 * Type guard checking whether a given value adheres to the Zustand `StoreApi` contract.
 */
export function isWritableStoreApi<T = unknown>(
  value: unknown,
): value is StoreApi<T> {
  return (
    isReadonlyStoreApi(value) &&
    'setState' in value &&
    typeof (value as Record<string, unknown>).setState === 'function'
  );
}

/**
 * Composite hook matcher for Zustand v5's `useStore` hook.
 *
 * Sequence of 3 consecutive hooks:
 * 1. `useCallback` for `getSelection`: `deps[0]` is either `StoreApi` or `store.getState`.
 * 2. `useCallback` for `getServerSelection`: `deps[0]` is either `StoreApi` or `store.getInitialState`.
 * 3. `useSyncExternalStore`: `getSnapshot` returns state (or `StoreApi`), and `cachedValue` is the snapshot.
 */
export const zustandUseStoreMatcher: CompositeHookMatcher<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ZustandUseStoreHook<any, any>
> = {
  name: 'zustand:useStore',

  match(hooks: AnyHook[], startIndex: number) {
    if (startIndex + 2 >= hooks.length) {
      return null;
    }

    const hook1 = hooks[startIndex];
    const hook2 = hooks[startIndex + 1];
    const hook3 = hooks[startIndex + 2];

    if (
      (hook1.type !== 'useCallback' && hook1.type !== 'useMemoOrCallback') ||
      (hook2.type !== 'useCallback' && hook2.type !== 'useMemoOrCallback') ||
      hook3.type !== 'useSyncExternalStore'
    ) {
      return null;
    }

    if (
      typeof hook1.value !== 'function' ||
      typeof hook2.value !== 'function' ||
      hook1.dependencies[1] !== hook2.dependencies[1]
    ) {
      return null;
    }

    // Identify StoreApi from getSnapshot() or either callback's dependencies.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let store: ReadonlyStoreApi<any> | null = null;

    try {
      const snapshot = hook3.getSnapshot();
      if (isReadonlyStoreApi(snapshot)) {
        store = snapshot;
      }
    } catch {
      // Ignore errors when calling getSnapshot()
    }

    const dep1 = hook1.dependencies?.[0];
    const dep2 = hook2.dependencies?.[0];

    for (const dependency of [dep1, dep2]) {
      if (isReadonlyStoreApi(dependency)) {
        if (store && store !== dependency) {
          return null;
        }
        store = dependency;
      }
    }

    if (!store) {
      return null;
    }

    const isHook1Valid = dep1 === store || dep1 === store.getState;
    const isHook2Valid = dep2 === store || dep2 === store.getInitialState;

    if (!isHook1Valid || !isHook2Valid) {
      return null;
    }

    // Extract selector if provided in deps[1], otherwise default to identity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selector: (state: any) => any =
      typeof hook1.dependencies?.[1] === 'function' ?
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (hook1.dependencies[1] as (state: any) => any)
      : (state: unknown) => state;

    return {
      consumed: 3,
      hook: {
        type: 'zustand:useStore',
        store,
        selector,
        cachedValue: hook3.cachedValue,
      },
    };
  },
};
