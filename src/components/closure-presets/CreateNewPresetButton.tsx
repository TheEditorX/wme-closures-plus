import { SyntheticEvent } from 'react';
import { useTranslation } from '../../hooks';
import { useClosurePresetEditorManager } from './ClosurePresetEditorManager';

export function CreateNewPresetButton() {
  const { t } = useTranslation();
  const { openEditor } = useClosurePresetEditorManager();

  const handleClick = (event: SyntheticEvent) => {
    if (event.currentTarget instanceof HTMLElement) event.currentTarget.blur();
    openEditor();
  };

  return (
    <wz-button size="xs" color="text" onClick={handleClick}>
      + {t('sidebar_tab.closure_presets.list.create_btn')}
    </wz-button>
  );
}
