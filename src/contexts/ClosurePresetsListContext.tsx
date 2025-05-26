import { useLiveQuery } from 'dexie-react-hooks';
import {
  ClosurePreset,
  ClosurePresetMetadata,
} from 'interfaces/closure-preset';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { db } from '../db';

export interface ClosurePresetsListContext {
  /**
   * The list of closure presets loaded into the context.
   * This list is read-only and should not be modified directly.
   */
  readonly presets: ReadonlyArray<Readonly<ClosurePreset>>;

  /**
   * A boolean indicating whether the presets are currently being loaded.
   */
  readonly isLoading: boolean;

  /**
   * An error object if an error occured while loading the presets, otherwise null.
   */
  readonly error: Error | null;

  /**
   * A boolean indicating whether the presets are read-only.
   * If true, presets cannot be created, modified or deleted.
   */
  readonly isReadOnly: boolean;

  /**
   * Creates a new closure preset and adds it to the list.
   * @param preset The preset to be added to the list.
   * @returns A promise that resolves to the created preset.
   * @throws An error if the preset could not be created.
   */
  createPreset(
    preset: Omit<ClosurePreset, keyof ClosurePresetMetadata>,
  ): Promise<ClosurePreset>;

  /**
   * Updates an existing closure preset in the list.
   * @param presetId The preset ID to be updated.
   * @param preset The new preset data to update..
   * @returns A promise that resolves to the updated preset.
   * @throws An error if the preset could not be updated.
   */
  updatePreset(
    presetId: ClosurePresetMetadata['id'],
    preset: Omit<ClosurePreset, keyof ClosurePresetMetadata>,
  ): Promise<ClosurePreset>;

  /**
   * Deletes a closure preset from the list.
   * @param presetId The ID of the preset to be deleted.
   * @returns A promise that resolves when the preset has been deleted.
   * @throws An error if the preset could not be deleted.
   */
  deletePreset(presetId: string): Promise<void>;
}
const ClosurePresetsListContext = createContext<ClosurePresetsListContext>({
  presets: [],
  isLoading: false,
  error: new Error('ClosurePresetsListContext is not initialized'),
  isReadOnly: true,
  createPreset() {
    throw new Error('ClosurePresetsListContext is not initialized');
  },
  updatePreset() {
    throw new Error('ClosurePresetsListContext is not initialized');
  },
  deletePreset() {
    throw new Error('ClosurePresetsListContext is not initialized');
  },
});

interface ClosurePresetsListProviderProps {
  children: ReactNode;
}
export function ClosurePresetsListProvider({
  children,
}: ClosurePresetsListProviderProps) {
  const closurePresets = useLiveQuery(() =>
    db.closurePresets.orderBy('name').toArray(),
  );

  const contextData: ClosurePresetsListContext = useMemo(() => {
    return {
      presets: closurePresets,
      isLoading: !closurePresets,
      error: null,
      isReadOnly: false,

      createPreset: async (preset): Promise<ClosurePreset> => {
        // set the id, createdAt and updatedAt fields
        const newPreset: Omit<ClosurePreset, 'id'> = {
          ...preset,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // add the new preset to the list
        const id = await db.closurePresets.add(newPreset);
        return {
          id,
          ...newPreset,
        };
      },
      updatePreset: async (presetId, preset) => {
        await db.closurePresets.update(presetId, {
          ...preset,
          updatedAt: new Date().toISOString(),
        });
        return db.closurePresets.get(presetId);
      },
      deletePreset: async (presetId) => {
        await db.closurePresets.delete(presetId);
      },
    };
  }, [closurePresets]);

  return (
    <ClosurePresetsListContext value={contextData}>
      {children}
    </ClosurePresetsListContext>
  );
}

export function useClosurePresetsListContext(): ClosurePresetsListContext {
  const context = useContext(ClosurePresetsListContext);
  if (!context) {
    throw new Error(
      'useClosurePresetsListContext must be used within a ClosurePresetsListProvider',
    );
  }
  return context;
}
