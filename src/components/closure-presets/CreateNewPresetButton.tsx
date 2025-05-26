import { SyntheticEvent } from 'react';
import { useClosurePresetEditorManager } from './ClosurePresetEditorManager';

export function CreateNewPresetButton() {
  const { openEditor } = useClosurePresetEditorManager();

  const handleClick = (event: SyntheticEvent) => {
    if (event.currentTarget instanceof HTMLElement) event.currentTarget.blur();
    openEditor();
  };

  return (
    <wz-button size="xs" color="text" onClick={handleClick}>
      + Create preset
    </wz-button>
  );
}
