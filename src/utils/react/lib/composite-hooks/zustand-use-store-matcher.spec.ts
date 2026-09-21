import { createStore } from 'zustand/vanilla';
import type { AnyHook } from '../parse-fiber-hooks';
import {
  isReadonlyStoreApi,
  zustandUseStoreMatcher,
} from './zustand-use-store-matcher';

describe('zustandUseStoreMatcher', () => {
  interface TestState {
    counter: number;
    text: string;
  }

  const createMockStore = () =>
    createStore<TestState>(() => ({
      counter: 0,
      text: 'initial',
    }));

  it('should require the complete readonly store contract', () => {
    const store = createMockStore();
    const readonlyStore = {
      getState: store.getState,
      getInitialState: store.getInitialState,
      subscribe: store.subscribe,
    };

    expect(isReadonlyStoreApi(readonlyStore)).toBe(true);
    expect(
      isReadonlyStoreApi({
        getState: store.getState,
        subscribe: store.subscribe,
      }),
    ).toBe(false);
  });

  it('should match a Zustand v5 hook sequence where store is in deps[0]', () => {
    const store = createMockStore();
    const selector = (s: TestState) => s.counter;
    const getSelection = () => selector(store.getState());
    const getServerSelection = () => selector(store.getInitialState());

    const hooks: AnyHook[] = [
      {
        type: 'useCallback',
        value: getSelection,
        dependencies: [store, selector],
      },
      {
        type: 'useCallback',
        value: getServerSelection,
        dependencies: [store, selector],
      },
      {
        type: 'useSyncExternalStore',
        cachedValue: 0,
        getSnapshot: getSelection,
      },
    ];

    const match = zustandUseStoreMatcher.match(hooks, 0);

    expect(match).not.toBeNull();
    expect(match?.consumed).toBe(3);
    expect(match?.hook.type).toBe('zustand:useStore');
    expect(match?.hook.store).toBe(store);
    expect(match?.hook.selector).toBe(selector);
    expect(match?.hook.cachedValue).toBe(0);
  });

  it('should match a Zustand v5 hook sequence where getSnapshot returns the store', () => {
    const store = createMockStore();
    const selector = (s: TestState) => s;
    const getSnapshot = () => store;

    const hooks: AnyHook[] = [
      {
        type: 'useCallback',
        value: getSnapshot,
        dependencies: [store.getState, selector],
      },
      {
        type: 'useCallback',
        value: getSnapshot,
        dependencies: [store.getInitialState, selector],
      },
      {
        type: 'useSyncExternalStore',
        cachedValue: store,
        getSnapshot: getSnapshot as unknown as () => unknown,
      },
    ];

    const match = zustandUseStoreMatcher.match(hooks, 0);

    expect(match).not.toBeNull();
    expect(match?.consumed).toBe(3);
    expect(match?.hook.type).toBe('zustand:useStore');
    expect(match?.hook.store).toBe(store);
  });

  it('should match ambiguous callback tuples only as a complete Zustand sequence', () => {
    const store = createMockStore();
    const selector = (s: TestState) => s.counter;
    const getSelection = () => selector(store.getState());
    const getServerSelection = () => selector(store.getInitialState());
    const hooks: AnyHook[] = [
      {
        type: 'useMemoOrCallback',
        value: getSelection,
        dependencies: [store, selector],
      },
      {
        type: 'useMemoOrCallback',
        value: getServerSelection,
        dependencies: [store, selector],
      },
      {
        type: 'useSyncExternalStore',
        cachedValue: 0,
        getSnapshot: getSelection,
      },
    ];

    expect(zustandUseStoreMatcher.match(hooks, 0)?.hook.store).toBe(store);
  });

  it('should reject an unrelated second callback', () => {
    const store = createMockStore();
    const selector = (s: TestState) => s.counter;
    const unrelated = () => 1;
    const hooks: AnyHook[] = [
      {
        type: 'useCallback',
        value: () => selector(store.getState()),
        dependencies: [store, selector],
      },
      {
        type: 'useCallback',
        value: unrelated,
        dependencies: [unrelated, selector],
      },
      {
        type: 'useSyncExternalStore',
        cachedValue: 0,
        getSnapshot: () => 0,
      },
    ];

    expect(zustandUseStoreMatcher.match(hooks, 0)).toBeNull();
  });

  it('should reject callbacks that depend on different stores', () => {
    const store1 = createMockStore();
    const store2 = createMockStore();
    const selector = (s: TestState) => s.counter;
    const hooks: AnyHook[] = [
      {
        type: 'useCallback',
        value: () => selector(store1.getState()),
        dependencies: [store1, selector],
      },
      {
        type: 'useCallback',
        value: () => selector(store2.getInitialState()),
        dependencies: [store2, selector],
      },
      {
        type: 'useSyncExternalStore',
        cachedValue: 0,
        getSnapshot: () => 0,
      },
    ];

    expect(zustandUseStoreMatcher.match(hooks, 0)).toBeNull();
  });

  it('should reject callbacks with different selectors', () => {
    const store = createMockStore();
    const selector1 = (s: TestState) => s.counter;
    const selector2 = (s: TestState) => s.counter;
    const hooks: AnyHook[] = [
      {
        type: 'useCallback',
        value: () => selector1(store.getState()),
        dependencies: [store, selector1],
      },
      {
        type: 'useCallback',
        value: () => selector2(store.getInitialState()),
        dependencies: [store, selector2],
      },
      {
        type: 'useSyncExternalStore',
        cachedValue: 0,
        getSnapshot: () => 0,
      },
    ];

    expect(zustandUseStoreMatcher.match(hooks, 0)).toBeNull();
  });

  it('should only accept method dependencies owned by the resolved store', () => {
    const store = createMockStore();
    const selector = (s: TestState) => s.counter;
    const unrelatedGetInitialState = function getInitialState() {
      return store.getInitialState();
    };
    const hooks: AnyHook[] = [
      {
        type: 'useCallback',
        value: () => selector(store.getState()),
        dependencies: [store.getState, selector],
      },
      {
        type: 'useCallback',
        value: () => selector(unrelatedGetInitialState()),
        dependencies: [unrelatedGetInitialState, selector],
      },
      {
        type: 'useSyncExternalStore',
        cachedValue: store,
        getSnapshot: () => store,
      },
    ];

    expect(zustandUseStoreMatcher.match(hooks, 0)).toBeNull();
  });

  it('should return null if there are fewer than 3 hooks remaining', () => {
    const store = createMockStore();
    const hooks: AnyHook[] = [
      {
        type: 'useCallback',
        value: () => store.getState(),
        dependencies: [store],
      },
      {
        type: 'useCallback',
        value: () => store.getInitialState(),
        dependencies: [store],
      },
    ];

    expect(zustandUseStoreMatcher.match(hooks, 0)).toBeNull();
  });

  it('should return null if hook types do not match the sequence', () => {
    const store = createMockStore();
    const hooks: AnyHook[] = [
      {
        type: 'useCallback',
        value: () => store.getState(),
        dependencies: [store],
      },
      {
        type: 'useState',
        value: 1,
        dispatch: jest.fn(),
      },
      {
        type: 'useSyncExternalStore',
        cachedValue: 0,
        getSnapshot: () => 0,
      },
    ];

    expect(zustandUseStoreMatcher.match(hooks, 0)).toBeNull();
  });

  it('should return null if no store can be extracted', () => {
    const fn1 = () => 1;
    const fn2 = () => 2;
    const hooks: AnyHook[] = [
      {
        type: 'useCallback',
        value: fn1,
        dependencies: [fn1],
      },
      {
        type: 'useCallback',
        value: fn2,
        dependencies: [fn2],
      },
      {
        type: 'useSyncExternalStore',
        cachedValue: 0,
        getSnapshot: () => 0,
      },
    ];

    expect(zustandUseStoreMatcher.match(hooks, 0)).toBeNull();
  });
});
