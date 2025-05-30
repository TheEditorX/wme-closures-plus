import {
  ClosurePreset,
  ClosurePresetMetadata,
} from 'interfaces/closure-preset';
import { SerializedDateResolver } from 'consts/date-resolvers';
import { TimeOnly } from '../../../classes';
import { WeekdayFlags } from '../../../enums'; // Assuming this path is correct
import {
  ModalStepper,
  StepperNextButton,
  StepperPrevButton,
} from '../../stepper';
import { useTranslation } from '../../../hooks';
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
  const { t, unsafeT } = useTranslation();
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
          case 'CURRENT_DATE':
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
      title={t('edit.closure_preset.edit_dialog.title')[props.mode]}
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
          startDate:
            props.mode === 'CREATE' ? null
            : props.preset.closureDetails.startDate.type === 'CURRENT_DATE' ?
              { type: 'CURRENT_DATE' }
            : (
              props.preset.closureDetails.startDate.type ===
              'SPECIFIC_DAY_OF_WEEK'
            ) ?
              {
                type: 'DAY_OF_WEEK',
                value: new WeekdayFlags(
                  props.preset.closureDetails.startDate.args.dayOfWeek,
                ),
              }
            : null,
          startTime:
            props.mode === 'CREATE' || !props.preset.closureDetails.startTime ?
              null
            : new TimeOnly(
                props.preset.closureDetails.startTime.hours,
                props.preset.closureDetails.startTime.minutes,
                0,
                0,
              ),
          endTime:
            props.mode === 'CREATE' ? null
            : props.preset.closureDetails.end.type === 'FIXED' ?
              {
                type: 'FIXED',
                value: new TimeOnly(
                  props.preset.closureDetails.end.time.hours,
                  props.preset.closureDetails.end.time.minutes,
                  0,
                  0,
                ),
              }
            : props.preset.closureDetails.end.type === 'DURATIONAL' ?
              {
                type: 'DURATIONAL',
                duration:
                  props.preset.closureDetails.end.duration.hours * 60 +
                  props.preset.closureDetails.end.duration.minutes,
              }
            : null,
        },
      }}
      steps={[
        {
          id: STEP_PRESET_INFO_SYMBOL,
          title: t('edit.closure_preset.edit_dialog.steps.PRESET_INFO.title'),
          description: t(
            'edit.closure_preset.edit_dialog.steps.PRESET_INFO.description',
          ),
          icon: {
            name: 'project-fill',
            color: '#B80000',
          },
          content: <PresetInformationStep />,
          actions: (data) => (
            <>
              <StepperNextButton disabled={!data.name}>
                {t(
                  'edit.closure_preset.edit_dialog.steps.PRESET_INFO.next_btn',
                )}
              </StepperNextButton>
              <StepperPrevButton color="secondary">
                {unsafeT('edit.cancel')}
              </StepperPrevButton>
            </>
          ),
        },
        {
          id: STEP_CLOSURE_DETAILS_SYMBOL,
          title: t(
            'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.title',
          ),
          description: t(
            'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.description',
          ),
          icon: {
            name: 'inbox',
            color: 'var(--promotion_variant)',
          },
          content: <ClosureDetailsStep />,
          actions: (data) => (
            <>
              <StepperNextButton
                disabled={
                  !data.startDate ||
                  !data.endTime ||
                  (data.startDate.type === 'DAY_OF_WEEK' &&
                    !data.startDate.value)
                }
              >
                {t(
                  'edit.closure_preset.edit_dialog.steps.CLOSURE_DETAILS.next_btn',
                )}
              </StepperNextButton>
              <StepperPrevButton color="secondary">
                {t('common.previous')}
              </StepperPrevButton>
            </>
          ),
        },
        {
          id: STEP_SUMMARY_SYMBOL,
          title: t('edit.closure_preset.edit_dialog.steps.SUMMARY.title'),
          description: t(
            'edit.closure_preset.edit_dialog.steps.SUMMARY.description',
          ),
          icon: {
            name: 'info',
            color: 'var(--primary_variant)',
          },
          content: <SummaryStep />,
          actions: () => (
            <>
              <StepperNextButton>
                {unsafeT('toolbar.save.title')}
              </StepperNextButton>
              <StepperPrevButton color="secondary">
                {t('common.previous')}
              </StepperPrevButton>
            </>
          ),
        },
      ]}
    />
  );
}
