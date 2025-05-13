import { renderHook } from '@testing-library/react';
import { useUpdateEffect } from './useUpdateEffect';

describe('useUpdateEffect', () => {
  it('should not run the effect on initial render', () => {
    const effect = jest.fn();

    renderHook(() => useUpdateEffect(effect));

    expect(effect).not.toHaveBeenCalled();
  });

  it('should run the effect after dependency change', () => {
    const effect = jest.fn();
    const { rerender } = renderHook(
      ({ deps }) => useUpdateEffect(effect, deps),
      { initialProps: { deps: [1] } },
    );

    rerender({ deps: [2] });
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should not run the effect if dependencies do not change', () => {
    const effect = jest.fn();
    const { rerender } = renderHook(
      ({ deps }) => useUpdateEffect(effect, deps),
      { initialProps: { deps: [1] } },
    );

    rerender({ deps: [1] });
    expect(effect).not.toHaveBeenCalled();
  });

  it('should clean up when the effect returns a destructor', () => {
    const cleanup = jest.fn();
    const effect = jest.fn(() => cleanup);

    const { rerender } = renderHook(
      ({ deps }) => useUpdateEffect(effect, deps),
      { initialProps: { deps: [1] } },
    ); // mount of hook - won't trigger effect, won't trigger the cleanup

    rerender({ deps: [2] }); // the first update; will set the cleanup to trigger on the next re-render
    rerender({ deps: [3] }); // the second update, will call the cleanup
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should call cleanup when component unmounts', () => {
    const cleanup = jest.fn();
    const effect = jest.fn(() => cleanup);

    const { unmount, rerender } = renderHook(
      ({ deps }) => useUpdateEffect(effect, deps),
      { initialProps: { deps: [1] } },
    ); // mount of hook - won't trigger effect, won't trigger the cleanup and won't define the cleanup

    rerender({ deps: [2] }); // the first update, will set the cleanup to trigger on unmounting

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
