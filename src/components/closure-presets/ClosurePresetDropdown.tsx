import { useClosurePresetsListContext } from 'contexts';
import { ClosurePreset } from 'interfaces/closure-preset';
import { SelectHTMLAttributes, useMemo } from 'react';

interface ClosurePresetDropdownProps {
  label: string;
  placeholder?: string;
  options?: ReadonlyArray<Readonly<ClosurePreset>>;
  selectedId?: ClosurePreset['id'];
  onSelect?(preset: ClosurePreset): void;
  selectProps?: Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange' | 'placeholder'
  >;
}
export function ClosurePresetDropdown(props: ClosurePresetDropdownProps) {
  const options = useOptionsWithInheritance(props.options);
  const optionsMap = useOptionsMap(options);

  const handleChange = (event: Event) => {
    const targetValue = (event.target as HTMLSelectElement).value;
    const castedValue = parseInt(targetValue);
    if (isNaN(castedValue) || !optionsMap.has(castedValue)) return;
    props.onSelect?.(optionsMap.get(castedValue)!);
  };

  return (
    <wz-select
      {...props.selectProps}
      label={props.label}
      placeholder={props.placeholder}
      ref={(select: HTMLSelectElement) => {
        if (!select) return;

        select.addEventListener('change', handleChange);

        return () => {
          select.removeEventListener('change', handleChange);
        };
      }}
    >
      {Array.from(optionsMap.values()).map((option) => (
        <wz-option key={option.id} value={option.id}>
          {option.name}
        </wz-option>
      ))}
    </wz-select>
  );
}

function useOptionsWithInheritance(
  options?: ReadonlyArray<Readonly<ClosurePreset>>,
) {
  const inheritedOptions = useClosurePresetsListContext()?.presets;
  return useMemo(() => {
    if (options) return options;
    return inheritedOptions;
  }, [options, inheritedOptions]);
}

function useOptionsMap(options?: ReadonlyArray<Readonly<ClosurePreset>>) {
  const optionsMap: ReadonlyMap<ClosurePreset['id'], ClosurePreset> =
    useMemo(() => {
      const map = new Map<ClosurePreset['id'], ClosurePreset>();
      options?.forEach((option) => {
        map.set(option.id, option);
      });
      return map;
    }, [options]);

  return optionsMap;
}
