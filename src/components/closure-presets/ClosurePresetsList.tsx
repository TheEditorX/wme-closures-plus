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
        {/* @i18n sidebar_tab.closure_presets.list.messages.NO_PRESETS.title */}
        title="No presets here yet"
        {/* @i18n sidebar_tab.closure_presets.list.messages.NO_PRESETS.message */}
        message="Presets allows you to define common configuration to reuse then on closures."
      />
    );
  }

  return presets.map((preset) => (
    <PresetListCard key={preset.id} preset={preset} />
  ));
}
