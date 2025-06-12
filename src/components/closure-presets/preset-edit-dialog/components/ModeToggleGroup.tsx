import { Toggle, ToggleGroup } from '@base-ui-components/react';
import { PositionAwareToggleButton } from 'components/ToggleButton';

interface ModeOption {
  value: string;
  label: string;
}

interface ModeToggleGroupProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  options: ModeOption[];
}

export function ModeToggleGroup({
  value,
  onValueChange,
  options,
}: ModeToggleGroupProps) {
  return (
    <ToggleGroup
      value={value ? [value] : []}
      onValueChange={([newValue]) => {
        if (newValue) {
          onValueChange(newValue);
        }
      }}
      style={{ display: 'flex', marginBottom: 'var(--space-always-xs, 8px)' }}
    >
      {/* add a fictive toggle to prevent from BaseUI selecting the first option by default */}
      <Toggle style={{ display: 'none' }} value="" />

      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          render={
            <PositionAwareToggleButton style={{ flex: 1 }}>
              {option.label}
            </PositionAwareToggleButton>
          }
        />
      ))}
    </ToggleGroup>
  );
}
