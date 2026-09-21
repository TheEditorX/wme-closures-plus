import { isUseSyncExternalStore } from './is-use-sync-external-store';

describe('isUseSyncExternalStore', () => {
  it('should return true for a valid useSyncExternalStore hook value', () => {
    const hookValue = {
      memoizedState: { count: 0 },
      queue: {
        value: { count: 0 },
        getSnapshot: () => ({ count: 0 }),
      },
      baseState: null,
      baseQueue: null,
      next: null,
    };

    expect(isUseSyncExternalStore(hookValue)).toBe(true);
  });

  it('should return false if queue is null', () => {
    const hookValue = {
      memoizedState: { count: 0 },
      queue: null,
      baseState: null,
      baseQueue: null,
      next: null,
    };

    expect(isUseSyncExternalStore(hookValue)).toBe(false);
  });

  it('should return false if memoizedState property is missing', () => {
    const hookValue = {
      queue: {
        value: 123,
        getSnapshot: () => 123,
      },
      baseState: null,
      baseQueue: null,
      next: null,
    };

    expect(isUseSyncExternalStore(hookValue)).toBe(false);
  });

  it('should return false if queue does not have getSnapshot function', () => {
    const hookValue = {
      memoizedState: 123,
      queue: {
        value: 123,
      },
      baseState: null,
      baseQueue: null,
      next: null,
    };

    expect(isUseSyncExternalStore(hookValue)).toBe(false);
  });

  it('should return false if queue does not have value property', () => {
    const hookValue = {
      memoizedState: 123,
      queue: {
        getSnapshot: () => 123,
      },
      baseState: null,
      baseQueue: null,
      next: null,
    };

    expect(isUseSyncExternalStore(hookValue)).toBe(false);
  });

  it('should return false for primitives and null', () => {
    expect(isUseSyncExternalStore(null)).toBe(false);
    expect(isUseSyncExternalStore(undefined)).toBe(false);
    expect(isUseSyncExternalStore('hook')).toBe(false);
    expect(isUseSyncExternalStore(42)).toBe(false);
  });
});
