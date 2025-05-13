import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useStepperDataReducer } from './useStepperDataReducer';

describe('useStepperDataReducer', () => {
  it('should initialize with the provided initial data', () => {
    const initialData = { step1: 'data1', step2: 'data2' };

    const { result } = renderHook(() =>
      useStepperDataReducer(['step1', 'step2'], initialData),
    );

    expect(result.current[0]).toEqual(initialData);
  });

  it('should initialize with an empty object if no initial data is provided', () => {
    const { result } = renderHook(() =>
      useStepperDataReducer(['step1', 'step2']),
    );

    expect(result.current[0]).toEqual({ step1: {}, step2: {} });
  });

  it("should update specific step's data", () => {
    const initialData = { step1: 'data1', step2: 'initial data2' };

    const { result } = renderHook(() =>
      useStepperDataReducer(['step1', 'step2'], initialData),
    );
    const [, dispatch] = result.current;

    act(() => dispatch({ type: 'SET_STEP', stepId: 'step2', data: 'data2' }));

    expect(result.current[0]).toEqual({ step1: 'data1', step2: 'data2' });
  });

  it("should clear specific step's data", () => {
    const initialData = {
      step1: { value: 'data1' },
      step2: { value: 'data2' },
    };

    const { result } = renderHook(() =>
      useStepperDataReducer(['step1', 'step2'], initialData),
    );
    const [, dispatch] = result.current;

    act(() => dispatch({ type: 'CLEAR_STEP', stepId: 'step2' }));

    expect(result.current[0]).toEqual({ step1: { value: 'data1' }, step2: {} });
  });

  it("should clear all step's data", () => {
    const initialData = {
      step1: { value: 'data1' },
      step2: { value: 'data2' },
    };

    const { result } = renderHook(() =>
      useStepperDataReducer(['step1', 'step2'], initialData),
    );
    const [, dispatch] = result.current;

    act(() => dispatch({ type: 'CLEAR_ALL' }));

    expect(result.current[0]).toEqual({ step1: {}, step2: {} });
  });
});
