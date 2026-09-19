import { Fiber } from 'react-reconciler';
import { getFiberProps } from './get-fiber-props';
import {
  AnyHook,
  parseFiberHooks,
  UseCallbackHook,
  UseMemoHook,
  UseRefHook,
  UseStateHook,
  UseSyncExternalStoreHook,
} from './parse-fiber-hooks';
import {
  AnyCompositeHook,
  defaultCompositeHookEngine,
  ZustandUseStoreHook,
} from './composite-hooks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ParsedFiber<P extends object = Record<string, any>> {
  fiber: Fiber;
  hooks: {
    all: (AnyHook | AnyCompositeHook)[];
    useState: UseStateHook[];
    useMemo: UseMemoHook[];
    useRef: UseRefHook[];
    useCallback: UseCallbackHook[];
    useSyncExternalStore: UseSyncExternalStoreHook[];
    zustand: {
      useStore: ZustandUseStoreHook[];
    };
  };
  props: P;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findParentFiber<P extends object = Record<string, any>>(
  startingFiber: Fiber,
  predicate: (fiber: ParsedFiber) => fiber is ParsedFiber<P>,
  maxDepth?: number,
): ParsedFiber<P>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findParentFiber<P extends object = Record<string, any>>(
  startingFiber: Fiber,
  predicate: (fiber: ParsedFiber) => boolean,
  maxDepth?: number,
): ParsedFiber<P>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findParentFiber<P extends object = Record<string, any>>(
  startingFiber: Fiber,
  predicate: (fiber: ParsedFiber) => boolean,
  maxDepth = Infinity,
): ParsedFiber<P> | null {
  let currentFiber: Fiber | null = startingFiber;
  let depth = 0;

  while (currentFiber && depth < maxDepth) {
    const rawHooks =
      currentFiber.memoizedState ? parseFiberHooks(currentFiber) : [];
    const compositeHooks = defaultCompositeHookEngine.parse(rawHooks);
    const props = getFiberProps(currentFiber);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const predicateSubject: ParsedFiber<any> = {
      fiber: currentFiber,
      hooks: {
        all: compositeHooks,
        useState: compositeHooks.filter(
          (hook): hook is UseStateHook => hook.type === 'useState',
        ),
        useMemo: compositeHooks.filter(
          (hook): hook is UseMemoHook => hook.type === 'useMemo',
        ),
        useRef: compositeHooks.filter(
          (hook): hook is UseRefHook => hook.type === 'useRef',
        ),
        useCallback: compositeHooks.filter(
          (hook): hook is UseCallbackHook => hook.type === 'useCallback',
        ),
        useSyncExternalStore: compositeHooks.filter(
          (hook): hook is UseSyncExternalStoreHook =>
            hook.type === 'useSyncExternalStore',
        ),
        zustand: {
          useStore: compositeHooks.filter(
            (hook): hook is ZustandUseStoreHook =>
              hook.type === 'zustand:useStore',
          ),
        },
      },
      props,
    };

    if (predicate(predicateSubject)) {
      return predicateSubject;
    }

    currentFiber = currentFiber.return;
    depth++;
  }

  return null;
}
