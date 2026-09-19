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
    const hook2 = {
      memoizedState: [() => 'dark', [store, (s: { theme: string }) => s.theme]],
      queue: null,
      next: hook3,
    };
    const hook1 = {
      memoizedState: [() => 'dark', [store, (s: { theme: string }) => s.theme]],
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
