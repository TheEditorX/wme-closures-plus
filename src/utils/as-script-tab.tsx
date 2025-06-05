import {
  ComponentProps,
  ComponentType,
  FunctionComponent,
  ReactElement,
} from 'react';
import { ScriptTab, ScriptTabProps } from '../components/ScriptTab';
import { getDisplayName } from './get-display-name';

type DirectReactChildren = ReactElement | string | number;

type InheritedScriptTabProps = Pick<
  ScriptTabProps,
  'tabLabelEffect' | 'tabPaneEffect' | 'useLayoutEffectInstead'
>;

export function asScriptTab<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C extends ComponentType<any>,
  P extends InheritedScriptTabProps = ComponentProps<C> &
    InheritedScriptTabProps,
>(
  Component: C,
  tabLabel: DirectReactChildren,
  tabId?: string,
): FunctionComponent<P> {
  const tabbedComponent = ({
    tabLabelEffect,
    tabPaneEffect,
    useLayoutEffectInstead,
    ...props
  }: P) => {
    return (
      <ScriptTab
        tabId={tabId}
        tabLabel={tabLabel}
        tabLabelEffect={tabLabelEffect}
        tabPaneEffect={tabPaneEffect}
        useLayoutEffectInstead={useLayoutEffectInstead}
      >
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/*// @ts-expect-error */}
        <Component {...props} />
      </ScriptTab>
    );
  };
  tabbedComponent.displayName = `ScriptTab(${getDisplayName(Component)})`;

  return tabbedComponent;
}
