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

const EMPTY_ARRAY: readonly never[] = Object.freeze([]) as never[];

class LazyZustandHooks {
  private _useStore?: ZustandUseStoreHook[];

  constructor(private readonly _hooks: LazyFiberHooks) {}

  get useStore(): ZustandUseStoreHook[] {
    if (this._useStore === undefined) {
      const all = this._hooks.all;
      const len = all.length;

      if (len === 0) {
        this._useStore = EMPTY_ARRAY as unknown as ZustandUseStoreHook[];
      } else {
        const result: ZustandUseStoreHook[] = [];
        for (let i = 0; i < len; i++) {
          if (all[i].type === 'zustand:useStore') {
            result.push(all[i] as ZustandUseStoreHook);
          }
        }
        this._useStore = result;
      }
    }
    return this._useStore;
  }
}

class LazyFiberHooks {
  private _all?: (AnyHook | AnyCompositeHook)[];
  private _useState?: UseStateHook[];
  private _useMemo?: UseMemoHook[];
  private _useRef?: UseRefHook[];
  private _useCallback?: UseCallbackHook[];
  private _useSyncExternalStore?: UseSyncExternalStoreHook[];
  private _zustand?: LazyZustandHooks;

  constructor(private readonly _fiber: Fiber | null) {}

  get all(): (AnyHook | AnyCompositeHook)[] {
    if (this._all === undefined) {
      if (!this._fiber || !this._fiber.memoizedState) {
        this._all = EMPTY_ARRAY as unknown as (AnyHook | AnyCompositeHook)[];
      } else {
        const rawHooks = parseFiberHooks(this._fiber);
        this._all = defaultCompositeHookEngine.parse(rawHooks);
      }
    }
    return this._all;
  }

  get useState(): UseStateHook[] {
    if (this._useState === undefined) {
      this._useState = this._filter('useState');
    }
    return this._useState;
  }

  get useMemo(): UseMemoHook[] {
    if (this._useMemo === undefined) {
      this._useMemo = this._filter('useMemo');
    }
    return this._useMemo;
  }

  get useRef(): UseRefHook[] {
    if (this._useRef === undefined) {
      this._useRef = this._filter('useRef');
    }
    return this._useRef;
  }

  get useCallback(): UseCallbackHook[] {
    if (this._useCallback === undefined) {
      this._useCallback = this._filter('useCallback');
    }
    return this._useCallback;
  }

  get useSyncExternalStore(): UseSyncExternalStoreHook[] {
    if (this._useSyncExternalStore === undefined) {
      this._useSyncExternalStore = this._filter('useSyncExternalStore');
    }
    return this._useSyncExternalStore;
  }

  get zustand(): LazyZustandHooks {
    if (this._zustand === undefined) {
      this._zustand = new LazyZustandHooks(this);
    }
    return this._zustand;
  }

  private _filter<T extends AnyHook | AnyCompositeHook>(type: string): T[] {
    const all = this.all;
    const len = all.length;
    if (len === 0) {
      return EMPTY_ARRAY as unknown as T[];
    }

    const result: T[] = [];
    for (let i = 0; i < len; i++) {
      if (all[i].type === type) {
        result.push(all[i] as T);
      }
    }
    return result;
  }
}

const EMPTY_HOOKS = new LazyFiberHooks(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class LazyParsedFiber<P extends object = Record<string, any>>
  implements ParsedFiber<P>
{
  readonly fiber: Fiber;
  private _props?: P;
  private _hooks?: LazyFiberHooks;

  constructor(fiber: Fiber) {
    this.fiber = fiber;
  }

  get props(): P {
    if (this._props === undefined) {
      this._props = getFiberProps(this.fiber) as P;
    }
    return this._props;
  }

  get hooks(): ParsedFiber['hooks'] {
    if (this._hooks === undefined) {
      this._hooks =
        this.fiber.memoizedState ? new LazyFiberHooks(this.fiber) : EMPTY_HOOKS;
    }
    return this._hooks;
  }
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
    const predicateSubject = new LazyParsedFiber<P>(currentFiber);

    if (predicate(predicateSubject)) {
      return predicateSubject;
    }

    currentFiber = currentFiber.return;
    depth++;
  }

  return null;
}
