import type { StoreApi } from 'zustand';
import { Fiber } from 'react-reconciler';
import { findParentFiber } from './find-parent-fiber';
import { getFiber } from './get-fiber';

export type StoreSchemaPredicate<TState> = (state: unknown) => state is TState;

/**
 * Traverses up the React Fiber tree from a starting Fiber or DOM Element to find
 * a parent component that uses a Zustand store matching the provided schema predicate.
 *
 * @param startingFiberOrElement The starting Fiber or HTMLElement to traverse upwards from.
 * @param schemaPredicate Type guard predicate verifying that the store's state conforms to `TState`.
 * @param maxDepth Maximum depth to traverse up the Fiber tree (defaults to 30).
 * @returns The matching `StoreApi<TState>` or `null` if not found.
 */
export function findParentStore<TState>(
  startingFiberOrElement: Fiber | HTMLElement,
  schemaPredicate: StoreSchemaPredicate<TState>,
  maxDepth = 30,
): StoreApi<TState> | null {
  if (!startingFiberOrElement) {
    return null;
  }

  let startingFiber: Fiber;
  if (
    typeof HTMLElement !== 'undefined' &&
    startingFiberOrElement instanceof HTMLElement
  ) {
    try {
      startingFiber = getFiber(startingFiberOrElement);
    } catch {
      return null;
    }
  } else if (
    'stateNode' in startingFiberOrElement ||
    'memoizedState' in startingFiberOrElement ||
    'tag' in startingFiberOrElement
  ) {
    startingFiber = startingFiberOrElement as Fiber;
  } else {
    return null;
  }

  let resolvedStore: StoreApi<TState> | null = null;

  findParentFiber(
    startingFiber,
    (parsed) => {
      for (const zustandHook of parsed.hooks.zustand.useStore) {
        try {
          const state = zustandHook.store.getState();
          if (schemaPredicate(state)) {
            resolvedStore = zustandHook.store as StoreApi<TState>;
            return true;
          }
        } catch {
          // Ignore error from getState or predicate and continue
        }
      }
      return false;
    },
    maxDepth,
  );

  return resolvedStore;
}
