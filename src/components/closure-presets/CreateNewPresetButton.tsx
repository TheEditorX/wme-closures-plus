import { SyntheticEvent, useState } from 'react';
import { useClosurePresetsListContext } from '../../contexts';
import { PresetEditingDialog } from './preset-edit-dialog';

export function CreateNewPresetButton() {
  const { createPreset } = useClosurePresetsListContext();
  const [isModalShown, setIsModalShown] = useState(false);

  const handleClick = (event: SyntheticEvent) => {
    if (event.currentTarget instanceof HTMLElement) event.currentTarget.blur();
    setIsModalShown(true);
  };

  return (
    <>
      <wz-button size="xs" color="text" onClick={handleClick}>
        + Create preset
      </wz-button>

      {isModalShown && (
        <PresetEditingDialog
          mode="CREATE"
          onComplete={(preset) => {
            createPreset(preset);
            setIsModalShown(false);
          }}
          onCancel={() => setIsModalShown(false)}
        />
      )}
    </>
  );
}
