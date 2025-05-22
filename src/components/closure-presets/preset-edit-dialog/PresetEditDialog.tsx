import { ClosurePreset } from 'interfaces/closure-preset';
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
import { PresetInformationStep } from './steps/PresetInformationStep';

interface CreatePresetModeProps {
  mode: 'CREATE';
}
interface EditPresetModeProps {
  mode: 'EDIT';
  preset: ClosurePreset;
}
type AnyModeProps = CreatePresetModeProps | EditPresetModeProps;

type PresetEditingDialogProps = AnyModeProps & {
  onCancel?(): void;
};
export function PresetEditingDialog(props: PresetEditingDialogProps) {
  return (
    <ModalStepper<PresetEditDialogData>
      size="lg"
      openOnMount
      onComplete={(data) => console.log(data)}
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
          startTime: '',
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
          content: null,
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
          content: null,
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
