import { SyntheticEvent } from 'react';
import { createUseStepState } from '../../../stepper';
import { PresetEditForm } from '../components';
import { STEP_PRESET_INFO_SYMBOL } from '../consts';
import { PresetEditDialogData } from '../interfaces';

const usePresetInfoState =
  createUseStepState<PresetEditDialogData[typeof STEP_PRESET_INFO_SYMBOL]>();

export function PresetInformationStep() {
  const [name, setName] = usePresetInfoState('name');
  const [description, setDescription] = usePresetInfoState('description');

  return (
    <PresetEditForm>
      <wz-text-input
        {/* @i18n edit.closure_preset.edit_dialog.steps.PRESET_INFO.preset_name.label */}
        label="* Preset name"
        {/* @i18n edit.closure_preset.edit_dialog.steps.PRESET_INFO.preset_name.description */}
        placeholder="23 to 5 Roadworks"
        {/* @i18n edit.closure_preset.edit_dialog.steps.PRESET_INFO.preset_name.helper */}
        helper-message="Give it a descriptive name so it's easy for you to find"
        value={name}
        onChange={(e: SyntheticEvent<HTMLInputElement, InputEvent>) =>
          setName(e.currentTarget.value)
        }
      />

      <wz-textarea
        {/* @i18n edit.closure_preset.edit_dialog.steps.PRESET_INFO.preset_description.label */}
        label="Preset description"
        {/* @i18n edit.closure_preset.edit_dialog.steps.PRESET_INFO.preset_description.description */}
        placeholder="Daily closures on weekdays for roadworks starting at 23:00 and ending 05:00 next morning"
        value={description}
        onChange={(e: SyntheticEvent<HTMLTextAreaElement, InputEvent>) =>
          setDescription(e.currentTarget.value)
        }
      />
    </PresetEditForm>
  );
}
