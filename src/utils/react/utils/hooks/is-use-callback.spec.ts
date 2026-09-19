import { isUseCallback } from './is-use-callback';

describe('isUseCallback', () => {
  it('should return true for a valid useCallback hook value', () => {
    const fn = () => 42;
    const hookValue = {
      memoizedState: [fn, []],
      queue: null,
      baseState: null,
      baseQueue: null,
      next: null,
    };

    expect(isUseCallback(hookValue)).toBe(true);
  });

  it('should return false if memoizedState[0] is not a function (i.e. regular useMemo)', () => {
    const hookValue = {
      memoizedState: [{ some: 'data' }, []],
      queue: null,
      baseState: null,
      baseQueue: null,
      next: null,
    };

    expect(isUseCallback(hookValue)).toBe(false);
  });

  it('should return false if queue is not null', () => {
    const hookValue = {
      memoizedState: [() => {}, []],
      queue: { dispatch: jest.fn() },
      baseState: null,
      baseQueue: null,
      next: null,
    };

    expect(isUseCallback(hookValue)).toBe(false);
  });

  it('should return false if memoizedState is not a 2-element array', () => {
    const hookValue = {
      memoizedState: [() => {}],
      queue: null,
      baseState: null,
      baseQueue: null,
      next: null,
    };

    expect(isUseCallback(hookValue)).toBe(false);
  });

  it('should return false for null, undefined, and non-object values', () => {
    expect(isUseCallback(null)).toBe(false);
    expect(isUseCallback(undefined)).toBe(false);
    expect(isUseCallback('string')).toBe(false);
    expect(isUseCallback(123)).toBe(false);
    expect(isUseCallback({})).toBe(false);
  });
});
