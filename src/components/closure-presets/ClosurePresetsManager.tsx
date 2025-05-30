import styled from '@emotion/styled';
import { useTranslation } from '../../hooks';
import { ClosurePresetEditorManagerProvider } from './ClosurePresetEditorManager';
import { CreateNewPresetButton } from './CreateNewPresetButton';
import { PresetsListMessage } from './PresetsListMessage';
import { ClosurePresetsList } from './ClosurePresetsList';
import { useClosurePresetsListContext } from 'contexts';

const SectionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space_always_xs, 8px)',
});
const SectionHeader = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

export function ClosurePresetsManager() {
  const { t } = useTranslation();
  const closurePresets = useClosurePresetsListContext();

  return (
    <ClosurePresetEditorManagerProvider>
      <SectionContainer>
        <SectionHeader>
          <wz-subhead5>
            {t('sidebar_tab.closure_presets.list.title')}
          </wz-subhead5>
          {!closurePresets.isReadOnly && <CreateNewPresetButton />}
        </SectionHeader>

        {closurePresets.error ?
          <PresetsListMessage
            isSlashed
            title={t(
              'sidebar_tab.closure_presets.list.messages.NOT_SUPPORTED.title',
            )}
            message={t(
              'sidebar_tab.closure_presets.list.messages.NOT_SUPPORTED.message',
            )}
          />
        : <ClosurePresetsList presets={closurePresets.presets} />}
      </SectionContainer>
    </ClosurePresetEditorManagerProvider>
  );
}
