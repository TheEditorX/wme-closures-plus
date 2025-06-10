import {
  ChangeEvent,
  ChangeEventHandler,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  useReducer,
} from 'react';

type HTMLElementWithValue =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;
type HTMLElementWithValueAttributes =
  | InputHTMLAttributes<HTMLInputElement>
  | TextareaHTMLAttributes<HTMLTextAreaElement>
  | SelectHTMLAttributes<HTMLSelectElement>;
type ValueType = HTMLElementWithValueAttributes['value'];

interface ChangeableValueProps<E extends HTMLElement> {
  value?: ValueType;
  onChange?: ChangeEventHandler<E>;
}

export function useManagedChangeableValue<
  E extends HTMLElementWithValue = HTMLInputElement,
>(props: ChangeableValueProps<E>): ChangeableValueProps<E> {
  const [uncontrolledValue, dispatchUncontrolledChange] = useValueReducer('');
  const { value: controlledValue, onChange: dispatchControlledChange } = props;

  if (controlledValue !== undefined && dispatchControlledChange !== undefined)
    return { value: controlledValue, onChange: dispatchControlledChange };

  return {
    value: uncontrolledValue,
    onChange: dispatchUncontrolledChange,
  };
}

function useValueReducer<E extends HTMLElementWithValue>(
  initialState: ValueType,
) {
  const [state, dispatch] = useReducer<ValueType, [ChangeEvent<E>]>(
    (_prevValue, changeEvent) => {
      return changeEvent.target.value;
    },
    initialState,
  );

  return [state, dispatch] as const;
}
