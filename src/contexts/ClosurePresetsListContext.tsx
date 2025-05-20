import { ClosurePreset, ClosurePresetMetadata } from 'interfaces/closure-preset';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

const PRESETS_DEMO: ClosurePreset[] = [
  {
    id: '1',
    name: 'Accident',
    description: 'This template defines a closure due to an accident',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    closureDetails: {
      description: 'Accident on the road',
      startDate: {
        type: 'CURRENT_DATE',
        args: null,
      },
      end: {
        type: 'DURATIONAL',
        duration: {
          hours: 2,
          minutes: 0,
        },
      },
    },
  },
  {
    id: '2',
    name: 'Construction',
    description: 'This template defines a closure due to an overnight construction',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    closureDetails: {
      description: 'Road is closed for construction; will reopen tomorrow',
      startDate: {
        type: 'CURRENT_DATE',
        args: null,
      },
      startTime: {
        hours: 22,
        minutes: 0,
      },
      end: {
        type: 'FIXED',
        time: {
          hours: 5,
          minutes: 0,
        }
      },
    },
  },
];

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
  createPreset(preset: Exclude<ClosurePreset, ClosurePresetMetadata>): Promise<ClosurePreset>;

  /**
   * Updates an existing closure preset in the list.
   * @param preset The preset to be updated.
   * @returns A promise that resolves to the updated preset.
   * @throws An error if the preset could not be updated.
   */
  updatePreset(preset: ClosurePreset): Promise<ClosurePreset>;

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
export function ClosurePresetsListProvider({ children }: ClosurePresetsListProviderProps) {
  const [presets, setPresets] = useState<ClosurePreset[]>(PRESETS_DEMO);

  const contextData: ClosurePresetsListContext = useMemo(() => {
    return {
      presets,
      isLoading: false,
      error: null,
      isReadOnly: false,

      createPreset: async (preset) => {
        throw new Error('Not implemented');
      },
      updatePreset: async (preset) => {
        throw new Error('Not implemented');
      },
      deletePreset: async (presetId) => {
        throw new Error('Not implemented');
      },
    }
  }, [presets]);

  return (
    <ClosurePresetsListContext value={contextData}>
      {children}
    </ClosurePresetsListContext>
  )
}

export function useClosurePresetsListContext(): ClosurePresetsListContext {
  const context = useContext(ClosurePresetsListContext);
  if (!context) {
    throw new Error('useClosurePresetsListContext must be used within a ClosurePresetsListProvider');
  }
  return context;
}
