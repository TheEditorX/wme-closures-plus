import styled from '@emotion/styled';
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
  const closurePresets = useClosurePresetsListContext();

  return (
    <ClosurePresetEditorManagerProvider>
      <SectionContainer>
        <SectionHeader>
          {/* @i18n sidebar_tab.closure_presets.list.title */}
          <wz-subhead5>Closure Presets</wz-subhead5>
          {!closurePresets.isReadOnly && <CreateNewPresetButton />}
        </SectionHeader>

        {closurePresets.error ?
          <PresetsListMessage
            isSlashed
            {/* @i18n sidebar_tab.closure_presets.list.messages.NOT_SUPPORTED.title */}
            title="Closure Presets Not Supported"
            {/* @i18n sidebar_tab.closure_presets.list.messages.NOT_SUPPORTED.message */}
            message="This browser lacks the necessary features to save and load closure presets"
          />
        : <ClosurePresetsList presets={closurePresets.presets} />}
      </SectionContainer>
    </ClosurePresetEditorManagerProvider>
  );
}
