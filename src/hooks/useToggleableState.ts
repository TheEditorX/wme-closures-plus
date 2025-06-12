import { useState, useCallback, useEffect } from 'react';

interface UseToggleableStateOptions<T> {
  initialValue: T;
  initialEnabled: boolean;
  onEnabled: (value: T) => void;
  onDisabled: () => void;
  onValueChanged: (value: T) => void;
}

/**
 * A hook for managing state that can be toggled on/off with separate local and external state
 * @param options - Configuration object containing event handlers and initial values
 * @returns A tuple with [value, setValue, enabled, setEnabled]
 */
export function useToggleableState<T>(
  options: UseToggleableStateOptions<T>,
): [T, (value: T) => void, boolean, (enabled: boolean) => void] {
  const { initialValue, initialEnabled, onEnabled, onDisabled, onValueChanged } = options;
  
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