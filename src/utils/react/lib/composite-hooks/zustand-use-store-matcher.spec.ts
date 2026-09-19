import { createStore } from 'zustand/vanilla';
import type { AnyHook } from '../parse-fiber-hooks';
import { zustandUseStoreMatcher } from './zustand-use-store-matcher';

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
