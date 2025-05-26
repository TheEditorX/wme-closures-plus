import { ClosurePreset } from 'interfaces/closure-preset';
import { SyntheticEvent, useRef } from 'react';
import { WzMenuElement } from 'types/waze/elements';
import { useClosurePresetsListContext } from '../../contexts';
import { useClosurePresetEditorManager } from './ClosurePresetEditorManager';

interface PresetListCardMenuProps {
  preset: ClosurePreset;
}
export function PresetListCardMenu({ preset }: PresetListCardMenuProps) {
  const { openEditor } = useClosurePresetEditorManager();
  const { deletePreset } = useClosurePresetsListContext();
  const menuRef = useRef<WzMenuElement>(null);

  const handleButtonClick = (e: SyntheticEvent<WzMenuElement, MouseEvent>) => {
    e.stopPropagation();
    menuRef.current?.toggleMenu(e.nativeEvent);
  };

  return (
    <>
      <wz-menu fixed ref={menuRef}>
        <wz-menu-item
          ref={(el: HTMLElement) => {
            if (!el) return;

            const handler = () => {
              openEditor(preset.id);
            };

            el.addEventListener('click', handler);
            return () => {
              el.removeEventListener('click', handler);
            };
          }}
        >
          <i className="w-icon w-icon-pencil" /> Edit
        </wz-menu-item>
        <wz-menu-item
          ref={(el: HTMLElement) => {
            if (!el) return;

            const handler = async () => {
              await deletePreset(preset.id);
            };

            el.addEventListener('click', handler);
            return () => {
              el.removeEventListener('click', handler);
            };
          }}
        >
          <i className="w-icon w-icon-trash" /> Delete
        </wz-menu-item>
      </wz-menu>

      <wz-button color="clear-icon" size="sm" onClick={handleButtonClick}>
        <i className="w-icon w-icon-dot-menu" />
      </wz-button>
    </>
  );
}
