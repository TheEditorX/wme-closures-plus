import { Fiber } from 'react-reconciler';
import { createStore } from 'zustand/vanilla';
import { parseFiberHooks } from '../parse-fiber-hooks';
import { defaultCompositeHookEngine } from './composite-hook-engine';

describe('CompositeHookEngine Performance', () => {
  const store = createStore(() => ({ value: 'test' }));

  // Helper to build a chain of N hook nodes in a fiber
  function buildSyntheticFiber(totalHooks: number): Fiber {
    let firstHook: Record<string, unknown> | null = null;
    let currentHook: Record<string, unknown> | null = null;

    let count = 0;
    while (count < totalHooks) {
      const mode = count % 3;
      let newHook: Record<string, unknown>;

      if (mode === 0) {
        // Primitive useState
        newHook = {
          memoizedState: count,
          queue: { dispatch: () => {}, pending: null },
          next: null,
        };
        count++;
      } else if (mode === 1 && count + 3 <= totalHooks) {
        // Zustand useStore 3-hook sequence
        const hook1 = {
          memoizedState: [() => store.getState(), [store]],
          queue: null,
          next: null,
        };
        const hook2 = {
          memoizedState: [() => store.getInitialState(), [store]],
          queue: null,
          next: null,
        };
        const hook3 = {
          memoizedState: store.getState(),
          queue: {
            value: store.getState(),
            getSnapshot: () => store.getState(),
          },
          next: null,
        };
        hook1.next = hook2 as unknown as null;
        hook2.next = hook3 as unknown as null;

        newHook = hook1;
        count += 3;
      } else {
        // Primitive useRef
        newHook = {
          memoizedState: { current: count },
          queue: null,
          next: null,
        };
        count++;
      }

      if (!firstHook) {
        firstHook = newHook;
        currentHook = newHook;
      } else if (currentHook) {
        // Find the tail of newHook if it was a multi-hook sequence
        let tail = newHook;
        while (tail.next) {
          tail = tail.next as Record<string, unknown>;
        }
        currentHook.next = newHook;
        currentHook = tail;
      }
    }

    return {
      memoizedState: firstHook,
      memoizedProps: {},
      return: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any as Fiber;
  }

  it('should parse 1,000 hooks efficiently within performance budget', () => {
    const fiber = buildSyntheticFiber(1000);

    // Warm-up
    parseFiberHooks(fiber);

    // 1. Primitive Hooks Parsing Baseline
    const startPrimitive = performance.now();
    const primitiveHooks = parseFiberHooks(fiber);
    const endPrimitive = performance.now();
    const primitiveDurationMs = endPrimitive - startPrimitive;

    expect(primitiveHooks.length).toBeGreaterThanOrEqual(1000);

    // 2. Composite Hooks Parsing Benchmark
    const startComposite = performance.now();
    const compositeHooks = defaultCompositeHookEngine.parse(primitiveHooks);
    const endComposite = performance.now();
    const compositeDurationMs = endComposite - startComposite;

    // Output benchmark info

    console.log(
      `[Perf Benchmark] 1,000 Hooks:\n` +
        `  - Primitive parsing: ${primitiveDurationMs.toFixed(3)} ms\n` +
        `  - Composite parsing: ${compositeDurationMs.toFixed(3)} ms\n` +
        `  - Composite hooks produced: ${compositeHooks.length}`,
    );

    // Performance budget assertions:
    // Parsing 1,000 hooks should take well under 50ms in any standard JS environment
    expect(primitiveDurationMs).toBeLessThan(50);
    expect(compositeDurationMs).toBeLessThan(50);
  });
});
