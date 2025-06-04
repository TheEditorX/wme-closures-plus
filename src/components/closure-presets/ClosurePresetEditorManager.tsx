import Logger from 'js-logger';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useClosurePresetsListContext } from '../../contexts';
import { ClosurePreset, ClosurePresetMetadata } from '../../interfaces';
import { PresetEditingDialog } from './preset-edit-dialog';

const logger = Logger.get('preset-editor-manager');

interface ClosurePresetEditorManager {
  openEditor(presetId?: ClosurePresetMetadata['id']): void;
}
const ClosurePresetEditorManagerContext =
  createContext<ClosurePresetEditorManager>(null!);

interface ClosurePresetEditorManagerProviderProps {
  children: ReactNode;
}
export function ClosurePresetEditorManagerProvider({
  children,
}: ClosurePresetEditorManagerProviderProps) {
  const { presets, createPreset, updatePreset } =
    useClosurePresetsListContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editingPreset, setEditingPreset] = useState<ClosurePreset | null>(
    null,
  );

  const context = useMemo<ClosurePresetEditorManager>(() => {
    const getPresetById = (presetId: ClosurePresetMetadata['id']) => {
      const preset = presets.find((p) => p.id === presetId);
      if (!preset) throw new Error(`Preset with ID ${presetId} not found`);
      return preset;
    };

    return {
      openEditor(presetId) {
        logger.debug('Opening preset editor', { presetId });
        setEditingPreset(presetId ? getPresetById(presetId) : null);
        setIsEditing(true);
      },
    };
  }, [presets]);

  return (
    <ClosurePresetEditorManagerContext.Provider value={context}>
      {children}
      {isEditing && (
        <PresetEditingDialog
          mode={editingPreset ? 'EDIT' : 'CREATE'}
          preset={editingPreset}
          onCancel={() => {
            logger.debug('Preset editor cancelled');
            setIsEditing(false);
          }}
          onComplete={async (newPresetValue) => {
            logger.debug('Preset editor completed');
            setIsEditing(false);

            if (!editingPreset) {
              logger.debug('Creating new preset', {
                preset: newPresetValue,
              });
              await createPreset(newPresetValue);
              return;
            }

            logger.debug('Editing existing preset', {
              presetId: editingPreset.id,
              oldPreset: editingPreset,
              newPresetDetails: newPresetValue,
            });
            await updatePreset(editingPreset.id, {
              ...newPresetValue,
            });
          }}
        />
      )}
    </ClosurePresetEditorManagerContext.Provider>
  );
}

export const ClosurePresetEditorManagerConsumer =
  ClosurePresetEditorManagerContext.Consumer;

export function useClosurePresetEditorManager() {
  const context = useContext(ClosurePresetEditorManagerContext);
  if (!context) {
    throw new Error(
      'useClosurePresetEditorManager must be used within a ClosurePresetEditorManagerProvider',
    );
  }

  return context;
}
