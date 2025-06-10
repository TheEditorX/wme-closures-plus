import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { useStepper } from '../StepperContext';

export function createUseStepState<D extends object>(): <K extends keyof D>(
  key: K,
  initialState?: D[K] | (() => D[K]),
) => [D[K], Dispatch<SetStateAction<D[K]>>];
export function createUseStepState<D extends object, I extends keyof D>(
  stepId: I,
): <K extends keyof D[I]>(
  key: K,
  initialState?: D[I][K] | (() => D[I][K]),
) => [D[I][K], Dispatch<SetStateAction<D[I][K]>>];
export function createUseStepState<D extends object>(
  pageId?: keyof D,
): <K extends keyof D>(
  key: K,
  initialState?: D[K] | (() => D[K]),
) => [D[K], Dispatch<SetStateAction<D[K]>>] {
  return function useBoundStepState<K extends keyof D>(
    key: K,
    initialState?: D[K] | (() => D[K]),
  ) {
    const { getStepData, updateStepData, currentStepConfig } = useStepper();

    const allStepData: D = getStepData(pageId || currentStepConfig.id);
    const requestedData = allStepData[key];

    const setRequestedData = useCallback<Dispatch<SetStateAction<D[K]>>>(
      (newValue) => {
        updateStepData(currentStepConfig.id, {
          [key]:
            typeof newValue === 'function' ?
              (newValue as (prevValue: D[K]) => D[K])(
                getStepData(currentStepConfig.id)[key],
              )
            : newValue,
        });
      },
      [currentStepConfig.id, getStepData, key, updateStepData],
    );

    (() => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const isInitialized = useRef(false);

      if (isInitialized.current) return;
      isInitialized.current = true;

      if (requestedData || !initialState) return;

      setRequestedData(initialState);
    })();

    return [requestedData, setRequestedData] as const;
  };
}
