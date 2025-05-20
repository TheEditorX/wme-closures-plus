import styled from '@emotion/styled';
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
    <SectionContainer>
      <SectionHeader>
        <wz-subhead5>Closure Presets</wz-subhead5>
        {!closurePresets.isReadOnly && <CreateNewPresetButton />}
      </SectionHeader>

      {closurePresets.error ?
        <PresetsListMessage
          isSlashed
          title="Closure Presets Not Supported"
          message="This browser lacks the necessary features to save and load closure presets"
        />
      : <ClosurePresetsList presets={closurePresets.presets} />}
    </SectionContainer>
  );
}
