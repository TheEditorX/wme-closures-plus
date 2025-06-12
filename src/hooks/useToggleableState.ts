import { useState, useCallback, useEffect } from 'react';

/**
 * A hook for managing state that can be toggled on/off with separate local and external state
 * @param initialValue - The initial value to populate the state with
 * @param initialEnabled - Whether the toggle should be initially enabled
 * @param onEnabled - Handler triggered when state is enabled (receives the current value)
 * @param onDisabled - Handler triggered when state is disabled (no arguments)
 * @param onValueChanged - Handler triggered when value changes and state is enabled (receives new value)
 * @returns A tuple with [value, setValue, enabled, setEnabled]
 */
export function useToggleableState<T>(
  initialValue: T,
  initialEnabled: boolean,
  onEnabled: (value: T) => void,
  onDisabled: () => void,
  onValueChanged: (value: T) => void,
): [T, (value: T) => void, boolean, (enabled: boolean) => void] {
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