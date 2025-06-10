/* eslint-disable react-hooks/exhaustive-deps */
import { ClosureEditorForm, ClosureGroupModelBasedEditorForm } from 'classes';
import { createContext, ReactNode, useContext, useMemo } from 'react';

const ClosureEditorFormContext = createContext<ClosureEditorForm>(null);

interface BaseProps {
  children: ReactNode;
}
interface StaticInstanceProps {
  closureEditorForm: ClosureEditorForm;
}
interface DynamicInstanceProps {
  type: 'CLOSURES_GROUP_MODEL_DOM_FORM';
  target: HTMLFormElement;
}
export function ClosureEditorFormContextProvider(
  props: BaseProps & (StaticInstanceProps | DynamicInstanceProps),
) {
  const formInstance = useMemo(() => {
    if ('closureEditorForm' in props) return props.closureEditorForm;

    switch (props.type) {
      case 'CLOSURES_GROUP_MODEL_DOM_FORM':
        return ClosureGroupModelBasedEditorForm.fromHTMLForm(props.target);
    }
  }, [
    'closureEditorForm' in props && props.closureEditorForm,
    'type' in props && props.type,
    'target' in props && props.target,
  ]);

  return (
    <ClosureEditorFormContext value={formInstance}>
      {props.children}
    </ClosureEditorFormContext>
  );
}

export const ClosureEditorFormContextConsumer =
  ClosureEditorFormContext.Consumer;

export function useClosureEditorFormContext() {
  const context = useContext(ClosureEditorFormContext);
  if (!context) {
    throw new Error(
      'useClosureEditorFormContext must be used within <ClosureEditorFormContext>',
    );
  }

  return context;
}
