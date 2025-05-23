/* eslint-disable @typescript-eslint/no-explicit-any */

import { ActionDispatch, useReducer } from 'react';
import { deepMerge } from '../../../utils';
import { StepId } from '../types';

interface SetStepDataAction<K extends StepId, D> {
  type: 'SET_STEP';
  stepId: K;
  data: D;
}

interface ClearStepDataAction<K extends StepId> {
  type: 'CLEAR_STEP';
  stepId: K;
}

interface ClearAllStepsDataAction {
  type: 'CLEAR_ALL';
}

type AnyAction =
  | SetStepDataAction<any, any>
  | ClearStepDataAction<any>
  | ClearAllStepsDataAction;

export function useStepperDataReducer<
  D extends Record<StepId, any> = Record<StepId, any>,
>(
  stepIds: StepId[],
  initialData?: D,
): [state: D, dispatch: ActionDispatch<[AnyAction]>] {
  const emptyState = Object.fromEntries(
    stepIds.map((stepId) => [stepId, {}] as const),
  ) as D;

  return useReducer<D, [AnyAction]>(
    stepperDataReducer as any,
    initialData ?? emptyState,
  );
}

function stepperDataReducer<
  D extends Record<StepId, any> = Record<StepId, any>,
>(state: D, action: AnyAction) {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        [action.stepId]: deepMerge(state[action.stepId], action.data),
      };
    case 'CLEAR_STEP':
      return { ...state, [action.stepId]: {} };
    case 'CLEAR_ALL':
      return Object.fromEntries(
        Object.keys(state).map((stepId) => [stepId, {}] as const),
      );
  }
}
