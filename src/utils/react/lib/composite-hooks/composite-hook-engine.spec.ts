import { createStore } from 'zustand/vanilla';
import type { AnyHook } from '../parse-fiber-hooks';
import {
  CompositeHookEngine,
  defaultCompositeHookEngine,
  parseCompositeHooks,
} from './composite-hook-engine';
import { zustandUseStoreMatcher } from './zustand-use-store-matcher';

describe('CompositeHookEngine', () => {
  const store = createStore(() => ({ val: 123 }));

  it('should scan sequentially, match composite hooks, and advance by consumed count', () => {
    const selector = (s: { val: number }) => s.val;
    const hooks: AnyHook[] = [
      {
        type: 'useState',
        value: 'initial',
        dispatch: jest.fn(),
      },
      // Zustand hook sequence (3 hooks)
      {
        type: 'useCallback',
        value: () => store.getState(),
        dependencies: [store, selector],
      },
      {
        type: 'useCallback',
        value: () => store.getInitialState(),
        dependencies: [store, selector],
      },
      {
        type: 'useSyncExternalStore',
        cachedValue: 123,
        getSnapshot: () => store.getState(),
      },
      {
        type: 'useRef',
        current: 'ref-value',
      },
    ];

    const engine = new CompositeHookEngine([zustandUseStoreMatcher]);
    const parsed = engine.parse(hooks);

    expect(parsed).toHaveLength(3);
    expect(parsed[0].type).toBe('useState');
    expect(parsed[1].type).toBe('zustand:useStore');
    expect(parsed[2].type).toBe('useRef');
  });

  it('should preserve unmatched primitive hooks in original order', () => {
    const hooks: AnyHook[] = [
      {
        type: 'useState',
        value: 1,
        dispatch: jest.fn(),
      },
      {
        type: 'useMemo',
        value: 2,
        dependencies: [],
      },
      {
        type: 'useRef',
        current: 3,
      },
    ];

    const parsed = defaultCompositeHookEngine.parse(hooks);
    expect(parsed).toHaveLength(3);
    expect(parsed[0].type).toBe('useState');
    expect(parsed[1].type).toBe('useMemo');
    expect(parsed[2].type).toBe('useRef');
  });

  it('should allow using parseCompositeHooks helper', () => {
    const hooks: AnyHook[] = [
      {
        type: 'useState',
        value: 'test',
        dispatch: jest.fn(),
      },
    ];

    const result = parseCompositeHooks(hooks);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('useState');
  });
});
