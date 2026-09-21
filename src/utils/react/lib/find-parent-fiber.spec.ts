import { Fiber } from 'react-reconciler';
import { createStore } from 'zustand/vanilla';
import { findParentFiber } from './find-parent-fiber';

describe('findParentFiber', () => {
  const store = createStore(() => ({ theme: 'dark' }));

  const createMockFiber = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    memoizedState: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: any = {},
    returnFiber: Fiber | null = null,
  ): Fiber =>
    ({
      memoizedState,
      memoizedProps: props,
      return: returnFiber,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any as Fiber;

  it('should populate ParsedFiber with composite and primitive hooks', () => {
    // Linked list of 3 hooks for Zustand useStore:
    // 1. useCallback
    // 2. useCallback
    // 3. useSyncExternalStore
    const hook3 = {
      memoizedState: 'dark',
      queue: {
        value: 'dark',
        getSnapshot: () => 'dark',
      },
      next: null,
    };
    const selector = (s: { theme: string }) => s.theme;
    const hook2 = {
      memoizedState: [() => 'dark', [store, selector]],
      queue: null,
      next: hook3,
    };
    const hook1 = {
      memoizedState: [() => 'dark', [store, selector]],
      queue: null,
      next: hook2,
    };

    const fiber = createMockFiber(hook1, { customProp: 'hello' });

    const result = findParentFiber(fiber, (parsed) => {
      expect(parsed.hooks.all).toHaveLength(1);
      expect(parsed.hooks.zustand.useStore).toHaveLength(1);
      expect(parsed.hooks.zustand.useStore[0].store).toBe(store);
      expect(parsed.props.customProp).toBe('hello');
      return true;
    });

    expect(result).not.toBeNull();
  });

  it('should preserve an unmatched function tuple as ambiguous', () => {
    const callback = () => 'value';
    const fiber = createMockFiber({
      memoizedState: [callback, []],
      queue: null,
      next: null,
    });

    findParentFiber(fiber, (parsed) => {
      expect(parsed.hooks.all).toEqual([
        {
          type: 'useMemoOrCallback',
          value: callback,
          dependencies: [],
        },
      ]);
      expect(parsed.hooks.useMemo).toEqual([]);
      expect(parsed.hooks.useCallback).toEqual([]);
      expect(parsed.hooks.useMemoOrCallback).toHaveLength(1);
      return true;
    });
  });

  it('should expose independent mutable hook arrays for fibers without hooks', () => {
    const firstFiber = createMockFiber(null);
    const secondFiber = createMockFiber(null);

    const first = findParentFiber(firstFiber, () => true);
    const second = findParentFiber(secondFiber, () => true);

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    if (!first || !second) return;

    first.hooks.all.push({
      type: 'useRef',
      current: 'added',
    });
    first.hooks.useState.push({
      type: 'useState',
      value: 1,
      dispatch: jest.fn(),
    });
    first.hooks.zustand.useStore.push({
      type: 'zustand:useStore',
      store,
      selector: (state) => state,
      cachedValue: store.getState(),
    });

    expect(first.hooks.all).toHaveLength(1);
    expect(first.hooks.useState).toHaveLength(1);
    expect(first.hooks.zustand.useStore).toHaveLength(1);
    expect(second.hooks.all).toEqual([]);
    expect(second.hooks.useState).toEqual([]);
    expect(second.hooks.zustand.useStore).toEqual([]);
  });

  it('should traverse up the fiber tree via fiber.return', () => {
    const parentFiber = createMockFiber(null, { role: 'parent' });
    const childFiber = createMockFiber(null, { role: 'child' }, parentFiber);

    const found = findParentFiber(childFiber, (parsed) => {
      return parsed.props.role === 'parent';
    });

    expect(found).not.toBeNull();
    expect(found?.props.role).toBe('parent');
  });

  it('should respect maxDepth', () => {
    const grandParent = createMockFiber(null, { level: 2 });
    const parent = createMockFiber(null, { level: 1 }, grandParent);
    const child = createMockFiber(null, { level: 0 }, parent);

    const found = findParentFiber(
      child,
      (parsed) => parsed.props.level === 2,
      2, // child is depth 0, parent is depth 1, grandParent is depth 2 -> maxDepth = 2 stops before depth 2
    );

    expect(found).toBeNull();
  });
});
