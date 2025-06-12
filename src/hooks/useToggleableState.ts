import { useState, useCallback } from 'react';

interface UseToggleableStateOptions<T> {
  onEnabled: (value: T) => void;
  onDisabled: () => void;
  onValueChanged: (value: T) => void;
}

/**
 * A hook for managing state that can be toggled on/off with separate local and external state
 * @param initialValue - The initial value of the state, can be a function that returns the initial value
 * @param initialEnabled - The initial enabled state, can be a function that returns the initial enabled state
 * @param options - Configuration object containing event handlers
 * @returns A tuple with [value, setValue, enabled, setEnabled]
 */
export function useToggleableState<T>(
  initialValue: T | (() => T),
  initialEnabled: boolean | (() => boolean),
  options: UseToggleableStateOptions<T>,
): [T, (value: T) => void, boolean, (enabled: boolean) => void] {
  const { onEnabled, onDisabled, onValueChanged } = options;

  const [localValue, setLocalValue] = useState<T>(initialValue);
  const [enabled, setEnabledState] = useState<boolean>(initialEnabled);

  const setValue = useCallback(
    (value: T) => {
      setLocalValue(value);
      if (enabled) {
        onValueChanged(value);
      }
    },
    [enabled, onValueChanged],
  );

  const setEnabled = useCallback(
    (newEnabled: boolean) => {
      if (newEnabled === enabled) return;

      setEnabledState(newEnabled);

      if (newEnabled) {
        onEnabled(localValue);
      } else {
        onDisabled();
      }
    },
    [enabled, localValue, onEnabled, onDisabled],
  );

  return [localValue, setValue, enabled, setEnabled];
}
