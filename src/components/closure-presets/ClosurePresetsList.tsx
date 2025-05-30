import { ClosurePreset } from 'interfaces/closure-preset';
import { useTranslation } from '../../hooks';
import { PresetsListMessage } from './PresetsListMessage';
import { PresetListCard } from './PresetListCard';

interface ClosurePresetsListProps {
  presets: ReadonlyArray<Readonly<ClosurePreset>>;
}
export function ClosurePresetsList({ presets }: ClosurePresetsListProps) {
  const { t } = useTranslation();
  if (!presets?.length) {
    return (
      <PresetsListMessage
        title={t('sidebar_tab.closure_presets.list.messages.NO_PRESETS.title')}
        message={t(
          'sidebar_tab.closure_presets.list.messages.NO_PRESETS.message',
        )}
      />
    );
  }

  return presets.map((preset) => (
    <PresetListCard key={preset.id} preset={preset} />
  ));
}
