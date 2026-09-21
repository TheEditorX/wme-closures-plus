import type { AnyHook } from '../parse-fiber-hooks';
import type { ZustandUseStoreHook } from './zustand-use-store-matcher';

export interface CompositeHookMatcher<TResult> {
  name: string;
  /**
   * Attempts to match a composite hook pattern starting at `startIndex`.
   * @returns `{ consumed, hook }` where `consumed` is the number of sequential
   * primitive hooks consumed by this composite hook, or `null` if no match.
   */
  match(
    hooks: AnyHook[],
    startIndex: number,
  ): { consumed: number; hook: TResult } | null;
}

export type AnyCompositeHook = ZustandUseStoreHook;
