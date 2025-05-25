import {
  ClosurePreset,
  ClosurePresetMetadata,
} from 'interfaces/closure-preset';
import { SerializedDateResolver } from 'consts/date-resolvers'; // Assuming this path is correct
import {
  ModalStepper,
  StepperNextButton,
  StepperPrevButton,
} from '../../stepper';
import {
  STEP_CLOSURE_DETAILS_SYMBOL,
  STEP_PRESET_INFO_SYMBOL,
  STEP_SUMMARY_SYMBOL,
} from './consts';
import { PresetEditDialogData } from './interfaces';
import { ClosureDetailsStep } from './steps/ClosureDetailsStep';
import { PresetInformationStep } from './steps/PresetInformationStep';
import { SummaryStep } from './steps/SummaryStep';

interface CreatePresetModeProps {
  mode: 'CREATE';
}
interface EditPresetModeProps {
  mode: 'EDIT';
  preset: ClosurePreset;
}
type AnyModeProps = CreatePresetModeProps | EditPresetModeProps;

type PresetEditingDialogProps = AnyModeProps & {
  onComplete?(preset: Omit<ClosurePreset, keyof ClosurePresetMetadata>): void;
  onCancel?(): void;
};
export function PresetEditingDialog(props: PresetEditingDialogProps) {
  return (
    <ModalStepper<PresetEditDialogData>
      size="lg"
      openOnMount
      onComplete={(data) => {
        if (!props.onComplete) {
          return;
        }

        const presetInfo = data[STEP_PRESET_INFO_SYMBOL];
        const closureDetailsData = data[STEP_CLOSURE_DETAILS_SYMBOL];

        let serializedStartDate: SerializedDateResolver;
        // startDate is guaranteed to be non-null by form validation before this step
        switch (closureDetailsData.startDate!.type) {
          case 'CURRENT_DAY':
            serializedStartDate = { type: 'CURRENT_DATE', args: null };
            break;
          case 'DAY_OF_WEEK':
            // Assuming closureDetailsData.startDate!.value (WeekdayFlags) is compatible
            // or can be cast to Weekday. A specific conversion function might be needed
            // if WeekdayFlags and Weekday are not directly assignable.
            serializedStartDate = {
              type: 'SPECIFIC_DAY_OF_WEEK',
              args: {
                dayOfWeek: closureDetailsData.startDate!.value.getValue(),
              },
            };
            break;
          default:
            // Should not happen if form validation is correct and types are exhaustive
            throw new Error(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              `Invalid startDate type: ${(closureDetailsData.startDate! as any).type}`,
            );
        }

        let closureEnd: ClosurePreset['closureDetails']['end'];
        // endTime is guaranteed to be non-null by form validation
        switch (closureDetailsData.endTime!.type) {
          case 'FIXED':
            closureEnd = {
              type: 'FIXED',
              time: {
                hours: closureDetailsData.endTime!.value.getHours(),
                minutes: closureDetailsData.endTime!.value.getMinutes(),
              },
            };
            break;
          case 'DURATIONAL': {
            const durationInMinutes = closureDetailsData.endTime!.duration;
            closureEnd = {
              type: 'DURATIONAL',
              duration: {
                hours: Math.floor(durationInMinutes / 60),
                minutes: durationInMinutes % 60,
              },
            };
            break;
          }
          default:
            // Should not happen if form validation is correct and types are exhaustive
            throw new Error(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              `Invalid endTime type: ${(closureDetailsData.endTime! as any).type}`,
            );
        }

        const closureStartTime =
          closureDetailsData.startTime ?
            {
              hours: closureDetailsData.startTime.getHours(),
              minutes: closureDetailsData.startTime.getMinutes(),
            }
          : undefined;

        props.onComplete({
          ...('preset' in props ? props.preset : {}),
          name: presetInfo.name,
          description: presetInfo.description,
          closureDetails: {
            description: closureDetailsData.description, // Can be "" or undefined
            startDate: serializedStartDate,
            startTime: closureStartTime,
            end: closureEnd,
          },
        } satisfies Omit<ClosurePreset, keyof ClosurePresetMetadata>);
      }}
      onCancelled={props.onCancel}
      title={props.mode === 'CREATE' ? 'Create new preset' : 'Edit preset'}
      initialData={{
        [STEP_PRESET_INFO_SYMBOL]: {
          name: props.mode === 'CREATE' ? '' : props.preset.name,
          description: props.mode === 'CREATE' ? '' : props.preset.description,
        },
        [STEP_CLOSURE_DETAILS_SYMBOL]: {
          description:
            props.mode === 'CREATE' ?
              ''
            : props.preset.closureDetails.description,
          startDate: null,
          startTime: null,
          endTime: null,
        },
      }}
      steps={[
        {
          id: STEP_PRESET_INFO_SYMBOL,
          title: 'Preset info',
          description:
            "Provide details for the closure preset you're about to create",
          icon: {
            name: 'project-fill',
            color: '#B80000',
          },
          content: <PresetInformationStep />,
          actions: (data) => (
            <>
              <StepperNextButton disabled={!data.name}>
                Next - Closure details
              </StepperNextButton>
              <StepperPrevButton color="secondary">Cancel</StepperPrevButton>
            </>
          ),
        },
        {
          id: STEP_CLOSURE_DETAILS_SYMBOL,
          title: 'Closure details',
          description: 'Add details about the closure that this preset sets',
          icon: {
            name: 'inbox',
            color: 'var(--promotion_variant)',
          },
          content: <ClosureDetailsStep />,
          actions: (data) => (
            <>
              <StepperNextButton disabled={!data.startDate || !data.endTime}>
                Next - Summary
              </StepperNextButton>
              <StepperPrevButton color="secondary">Back</StepperPrevButton>
            </>
          ),
        },
        {
          id: STEP_SUMMARY_SYMBOL,
          title: 'Summary',
          description: 'Review the preset before saving it',
          icon: {
            name: 'info',
            color: 'var(--primary_variant)',
          },
          content: <SummaryStep />,
          actions: () => (
            <>
              <StepperNextButton>Save</StepperNextButton>
              <StepperPrevButton color="secondary">Back</StepperPrevButton>
            </>
          ),
        },
      ]}
    />
  );
}
