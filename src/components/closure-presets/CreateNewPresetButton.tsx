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
      {/* @i18n sidebar_tab.closure_presets.list.create_btn */}
      {/* @i18n-remark Add a static plus symbol in front of the string */}
      + Create preset
    </wz-button>
  );
}
