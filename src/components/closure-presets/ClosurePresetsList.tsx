import { ClosurePreset } from 'interfaces/closure-preset';
import { PresetsListMessage } from './PresetsListMessage';
import { PresetListCard } from './PresetListCard';

interface ClosurePresetsListProps {
  presets: ReadonlyArray<Readonly<ClosurePreset>>;
}
export function ClosurePresetsList({ presets }: ClosurePresetsListProps) {
  if (!presets?.length) {
    return (
      <PresetsListMessage
        title="No presets here yet"
        message="Presets allows you to define common configuration to reuse then on closures."
      />
    );
  }

  return presets.map((preset) => (
    <PresetListCard key={preset.id} preset={preset} />
  ));
}
