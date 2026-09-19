import { Fiber } from 'react-reconciler';
import { createStore, StoreApi } from 'zustand/vanilla';
import { findParentStore } from './find-parent-store';

interface ClosureStoreState {
  closureId: string;
  isOpen: boolean;
}

function isClosureStore(state: unknown): state is ClosureStoreState {
  return (
    typeof state === 'object' &&
    state !== null &&
    'closureId' in state &&
    typeof (state as Record<string, unknown>).closureId === 'string' &&
    'isOpen' in state &&
    typeof (state as Record<string, unknown>).isOpen === 'boolean'
  );
}

describe('findParentStore', () => {
  const store: StoreApi<ClosureStoreState> = createStore(() => ({
    closureId: 'closure-123',
    isOpen: true,
  }));

  const createZustandFiber = (returnFiber: Fiber | null = null): Fiber => {
    const hook3 = {
      memoizedState: store.getState(),
      queue: {
        value: store.getState(),
        getSnapshot: () => store.getState(),
      },
      next: null,
    };
    const hook2 = {
      memoizedState: [() => store.getInitialState(), [store]],
      queue: null,
      next: hook3,
    };
    const hook1 = {
      memoizedState: [() => store.getState(), [store]],
      queue: null,
      next: hook2,
    };

    return {
      memoizedState: hook1,
      memoizedProps: {},
      return: returnFiber,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any as Fiber;
  };

  it('should find a parent store matching the schema predicate from a Fiber node', () => {
    const parentFiber = createZustandFiber();
    const childFiber = {
      memoizedState: null,
      memoizedProps: {},
      return: parentFiber,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any as Fiber;

    const extracted = findParentStore(childFiber, isClosureStore);

    expect(extracted).toBe(store);
    expect(extracted?.getState().closureId).toBe('closure-123');
  });

  it('should find a parent store from an HTMLElement with a __reactFiber$ property', () => {
    const parentFiber = createZustandFiber();
    const domElement = document.createElement('div');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (domElement as any)['__reactFiber$test1234'] = parentFiber;

    const extracted = findParentStore(domElement, isClosureStore);

    expect(extracted).toBe(store);
    expect(extracted?.getState().closureId).toBe('closure-123');
  });

  it('should return null if schema predicate does not match', () => {
    const otherStore = createStore(() => ({ foo: 'bar' }));
    const hook3 = {
      memoizedState: otherStore.getState(),
      queue: {
        value: otherStore.getState(),
        getSnapshot: () => otherStore.getState(),
      },
      next: null,
    };
    const hook2 = {
      memoizedState: [() => otherStore.getInitialState(), [otherStore]],
      queue: null,
      next: hook3,
    };
    const hook1 = {
      memoizedState: [() => otherStore.getState(), [otherStore]],
      queue: null,
      next: hook2,
    };

    const fiber = {
      memoizedState: hook1,
      memoizedProps: {},
      return: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any as Fiber;

    const extracted = findParentStore(fiber, isClosureStore);
    expect(extracted).toBeNull();
  });

  it('should return null if maxDepth is exceeded', () => {
    const parentFiber = createZustandFiber();
    let currentFiber = parentFiber;

    // Create a chain of 10 fibers
    for (let i = 0; i < 10; i++) {
      currentFiber = {
        memoizedState: null,
        memoizedProps: {},
        return: currentFiber,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any as Fiber;
    }

    const extracted = findParentStore(currentFiber, isClosureStore, 5);
    expect(extracted).toBeNull();
  });
});
