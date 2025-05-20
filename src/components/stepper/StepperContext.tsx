import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useStepperDataReducer } from './hooks';
import { StepConfig } from './interfaces';
import { StepId } from './types';

/**
 * Interface representing the value provided to and managed within a stepper context.
 *
 * @template D A generic type extending `Record<StepId, any>`,
 *             where `StepId` represents the unique identifier for each step
 *             and `D` defines the associated data structure for all steps.
 */
export interface StepperContextValue<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends Record<StepId, any> = Record<StepId, any>,
> {
  /** The index (zero-based) of the current step, or -1 if unavailable (i.e., when the Stepper is uninitialized) */
  currentStepIndex: number;

  /** The total number of steps, or -1 if unavailable (i.e., when the Stepper is uninitialized) */
  totalSteps: number;

  /** The step configuration for the current, active step, or null if unavailable */
  currentStepConfig: StepConfig<D, StepId> | null;

  goToNextStep(): void;
  goToPreviousStep(): void;
  goToStep(stepId: StepId): void;

  updateStepData(stepId: StepId, data: Partial<D[StepId]>): void;
  getStepData(
    stepId: StepId,
  ): StepId extends keyof ExistingData<D> ? ExistingData<D>[StepId] : never;

  isFirstStep: boolean;
  isLastStep: boolean;
}

const StepperContext = createContext<StepperContextValue>(undefined);

type ExistingData<D> = {
  [K in {
    [K in keyof D]: D[K] extends never ? never : K;
  }[keyof D]]: D[K];
};

export interface StepperProviderProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends Record<StepId, any> = Record<StepId, any>,
> {
  children: ReactNode;

  /** an array of StepConfig objects, where each object defines a step */
  steps: {
    [K in keyof D]: StepConfig<D, K>;
  }[keyof D][];

  /**
   * Pre-populates the stepper with existing data. The keys in this map/object should correspond to the id of each StepConfig.
   * This is useful if you're loading a saved state or have some default values.
   */
  initialData: ExistingData<D>;

  /**
   * A callback function that is triggered when the user successfully completes the last step.
   *
   * @param data - The data returned or generated upon the successful completion of the operation.
   */
  onComplete?: (data: ExistingData<D>) => void;

  /**
   * A callback function that can be triggered to indicate the user wants to cancel or dismiss the entire stepper flow.
   */
  onCancelled?: () => void;

  /**
   * A callback function that fires whenever the active step changes (after the navigation has occurred).
   *
   * @param previousStepIndex - The index of the previous step
   * @param previousStepId - The ID of the previous step
   * @param newStepIndex - The index of the new step (which is the current step)
   * @param newStepId - The ID of the new step
   * @param newStepConfig - The configuration of the new step
   * @param allStepData - The data for all steps keyed by {@link StepId step IDs}
   */
  onStepChange?: (
    previousStepIndex: number,
    previousStepId: StepId,
    newStepIndex: number,
    newStepId: StepId,
    newStepConfig: StepConfig<D, StepId>,
    allStepData: D,
  ) => void;
}
export function StepperProvider<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends Record<StepId, any> = Record<StepId, any>,
>(props: StepperProviderProps<D>) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const stepIds = useMemo(
    () => props.steps.map((step) => step.id),
    [props.steps],
  );
  const [stepData, dispatchStepData] = useStepperDataReducer(
    stepIds,
    props.initialData,
  );

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === props.steps.length - 1;

  const value = useMemo<StepperContextValue>(
    () => ({
      currentStepIndex,
      totalSteps: props.steps.length,
      currentStepConfig: props.steps[currentStepIndex] || null,

      goToNextStep() {
        if (isLastStep) {
          props.onComplete?.(stepData);
          return;
        }

        /*
          Not using updater function
          
          We want the new step to be calculated based on the last *actually* rendered step,
          rather than potentially stacking unrendered updates (i.e., when the function is called multiple times)
         */
        setCurrentStepIndex(currentStepIndex + 1);
      },
      goToPreviousStep() {
        if (isFirstStep) {
          props.onCancelled?.();
          return;
        }

        /*
          Not using updater function
          
          We want the new step to be calculated based on the last *actually* rendered step,
          rather than potentially stacking unrendered updates (i.e., when the function is called multiple times)
         */
        setCurrentStepIndex(currentStepIndex - 1);
      },
      goToStep(stepId: StepId) {
        const stepIndex = props.steps.findIndex((step) => {
          return step.id === stepId;
        });

        if (stepIndex === -1)
          throw new Error(
            `Unable to find a step with id of ${stepId.toString()}`,
          );
        setCurrentStepIndex(stepIndex);
      },

      updateStepData<K extends keyof D>(stepId: K, data: Partial<D[K]>) {
        dispatchStepData({
          type: 'SET_STEP',
          stepId,
          data,
        });
      },
      getStepData<K extends keyof ExistingData<D>>(stepId: K): D[K] {
        return stepData[stepId];
      },

      isFirstStep,
      isLastStep,
    }),
    [
      currentStepIndex,
      dispatchStepData,
      isFirstStep,
      isLastStep,
      props,
      stepData,
    ],
  );

  useEffect(() => {
    if (!value.currentStepConfig) return;

    const stepConfig = value.currentStepConfig;
    stepConfig.onEnter?.();

    return () => {
      stepConfig.onLeave?.();
    };
  }, [value.currentStepConfig]);

  return <StepperContext value={value}>{props.children}</StepperContext>;
}

export function useStepper<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends Record<StepId, any> = Record<StepId, any>,
>(): StepperContextValue<D> {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a <StepperProvider>');
  }
  return context;
}
