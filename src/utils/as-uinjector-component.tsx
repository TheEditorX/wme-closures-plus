import {
  UInjector,
  UInjectorProps,
  UInjectorRenderUIOptions,
} from 'components';
import { ComponentType, createElement, FunctionComponent } from 'react';
import { getDisplayName } from './get-display-name';

export type UInjectorComponentProps<E extends Element> =
  UInjectorRenderUIOptions<E>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function asUInjectorComponent<P extends {}, E extends Element = Element>(
  Component: ComponentType<P & UInjectorComponentProps<E>>,
  options: Omit<UInjectorProps, 'renderUI'>,
): ComponentType<
  Omit<P, keyof UInjectorRenderUIOptions> & Partial<typeof options>
> {
  const UInjectorComponent: FunctionComponent<P & typeof options> = (props) => {
    props = Object.assign({}, options, props);

    return (
      <UInjector
        {...props}
        renderUI={(options) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          createElement(Component as any, { ...options, ...props })
        }
      />
    );
  };
  UInjectorComponent.displayName = `asUInjector(${getDisplayName(Component)})`;

  return UInjectorComponent;
}
