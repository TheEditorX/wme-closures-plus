import { SyntheticEvent, useState } from 'react';
import { PresetEditingDialog } from './preset-edit-dialog';

export function CreateNewPresetButton() {
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
          onCancel={() => setIsModalShown(false)}
        />
      )}
    </>
  );
}
