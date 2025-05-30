import { SyntheticEvent } from 'react';
import { useTranslation } from '../../../../hooks';
import { createUseStepState } from '../../../stepper';
import { PresetEditForm } from '../components';
import { STEP_PRESET_INFO_SYMBOL } from '../consts';
import { PresetEditDialogData } from '../interfaces';

const usePresetInfoState =
  createUseStepState<PresetEditDialogData[typeof STEP_PRESET_INFO_SYMBOL]>();

export function PresetInformationStep() {
  const { t } = useTranslation();
  const [name, setName] = usePresetInfoState('name');
  const [description, setDescription] = usePresetInfoState('description');

  return (
    <PresetEditForm>
      <wz-text-input
        label={
          '* ' +
          t(
            'edit.closure_preset.edit_dialog.steps.PRESET_INFO.preset_name.label',
          )
        }
        placeholder={t(
          'edit.closure_preset.edit_dialog.steps.PRESET_INFO.preset_name.placeholder',
        )}
        helper-message={t(
          'edit.closure_preset.edit_dialog.steps.PRESET_INFO.preset_name.helper',
        )}
        value={name}
        onChange={(e: SyntheticEvent<HTMLInputElement, InputEvent>) =>
          setName(e.currentTarget.value)
        }
      />

      <wz-textarea
        label={
          '* ' +
          t(
            'edit.closure_preset.edit_dialog.steps.PRESET_INFO.preset_description.label',
          )
        }
        placeholder={t(
          'edit.closure_preset.edit_dialog.steps.PRESET_INFO.preset_description.placeholder',
        )}
        value={description}
        onChange={(e: SyntheticEvent<HTMLTextAreaElement, InputEvent>) =>
          setDescription(e.currentTarget.value)
        }
      />
    </PresetEditForm>
  );
}
