import { asUInjectorComponent } from 'utils/as-uinjector-component';
import { RecurringClosure } from './RecurringClosure';
import {
  ClosureEditorFormContextConsumer,
  ClosureEditorFormContextProvider,
} from 'contexts';
import { useChangeContainerPadding, useTranslation } from 'hooks';
import { ClosureEditorGroup } from './ClosureEditorGroup';
import { ClosurePresetDropdown } from 'components/closure-presets/ClosurePresetDropdown';
import { applyClosurePreset } from 'utils';

interface ClosureEditorPanelProps {
  target: HTMLElement;
}
function ClosureEditorPanel(props: ClosureEditorPanelProps) {
  const { t } = useTranslation();
  // Look for either wz-tab or wz-card, as different UIs might use different components
  const closestTab = props.target.closest<HTMLElement>('wz-tab');
  const closestCard = props.target.closest<HTMLElement>('wz-card');
  const containerElement = closestTab || closestCard;

  const originalPadding = useChangeContainerPadding(containerElement, 0);
  if (originalPadding && containerElement) {
    containerElement.style.setProperty(
      '--trimmed-padding',
      originalPadding.map((p) => `${p.value}${p.unit}`).join(' '),
    );
    // Restore padding to the target element
    props.target.style.padding = `var(--trimmed-padding)`;
    // Recursively find all elements to whom we need to apply the padding
    // These are the siblings of the target element, and siblings of their respective parents (up to the container)
    let parent = props.target.parentElement,
      triggerer = props.target;
    while (parent) {
      Array.from(parent.children).forEach((child) => {
        if (child instanceof HTMLElement && child !== triggerer) {
          child.style.padding = `var(--trimmed-padding)`;
        }
      });
      triggerer = parent;
      parent = parent.parentElement;
      if (parent === containerElement) break;
    }
  }

  return (
    <ClosureEditorFormContextProvider
      type="CLOSURES_GROUP_MODEL_DOM_FORM"
      target={props.target as HTMLFormElement}
    >
      <ClosureEditorGroup hasBorder disableTopPadding={!!closestCard}>
        <ClosureEditorFormContextConsumer>
          {(closureEditorForm) => (
            <ClosurePresetDropdown
              label={t('edit.closure.preset_apply_dropdown')}
              onSelect={(preset) => {
                applyClosurePreset(preset, closureEditorForm);
              }}
            />
          )}
        </ClosureEditorFormContextConsumer>
      </ClosureEditorGroup>
      <RecurringClosure closureEditPanel={props.target} />
    </ClosureEditorFormContextProvider>
  );
}

const UInjectorComponent = asUInjectorComponent(ClosureEditorPanel, {
  targetSelector: '.edit-closure',
  position: 'BEFORE',
  wrapInContainer: false,
});
export { UInjectorComponent as ClosureEditorPanel };
