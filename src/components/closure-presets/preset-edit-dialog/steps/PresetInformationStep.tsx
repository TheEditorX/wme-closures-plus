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
        label="* Preset name"
        placeholder="23 to 5 Roadworks"
        helper-message="Give it a descriptive name so it's easy for you to find"
        value={name}
        onChange={(e: SyntheticEvent<HTMLInputElement, InputEvent>) =>
          setName(e.currentTarget.value)
        }
      />

      <wz-textarea
        label="Preset description"
        placeholder="Daily closures on weekdays for roadworks starting at 23:00 and ending 05:00 next morning"
        value={description}
        onChange={(e: SyntheticEvent<HTMLInputElement, InputEvent>) =>
          setDescription(e.currentTarget.value)
        }
      />
    </PresetEditForm>
  );
}
