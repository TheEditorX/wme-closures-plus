import { useLayoutEffect } from 'react';

type CSSUnit = 'px' | 'em' | 'rem' | '%';

interface PaddingComponentStructuredValue {
  value: number;
  unit: CSSUnit;
}
type PaddingComponentValue =
  | number
  | `${number}${CSSUnit}`
  | PaddingComponentStructuredValue;

export function useChangeContainerPadding(
  containerElement: HTMLElement,
  newPadding: PaddingComponentValue[] | string | number,
): PaddingComponentStructuredValue[] | null {
  const container = useShadowElement(containerElement);

  const originalPadding =
    container ? getComputedStyle(container).padding : null;
  const paddingValues =
    originalPadding ? parsePaddingValue(originalPadding) : null;

  useLayoutEffect(() => {
    if (!container) return;

    const originalOverflow = getComputedStyle(container).overflow;

    container.style.overflow = 'hidden';

    return () => {
      container.style.overflow = originalOverflow;
    };
  }, [container]);

  useLayoutEffect(() => {
    const newPaddingValues = (() => {
      if (typeof newPadding === 'string') return parsePaddingValue(newPadding);
      if (typeof newPadding === 'number')
        return [{ value: newPadding, unit: 'px' }];

      return newPadding.map((paddingValue) => {
        if (typeof paddingValue === 'number') {
          return {
            value: paddingValue,
            unit: 'px',
          } as PaddingComponentStructuredValue;
        }
        if (typeof paddingValue === 'string') {
          return parsePaddingValue(paddingValue)[0];
        }
        return paddingValue;
      });
    })();

    // Apply the new padding values
    if (container)
      container.style.padding = `${newPaddingValues.map((val) => `${val.value}${val.unit}`).join(' ')}`;

    return () => {
      // Reset to original padding on cleanup
      if (container) container.style.padding = originalPadding;
    };
  }, [container, newPadding, originalPadding]);

  return paddingValues;
}

function parsePaddingValue(value: string): PaddingComponentStructuredValue[] {
  const paddingValues = value.split(' ').map((val) => {
    const match = val.match(/(\d+)([a-zA-Z%]+)/);
    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2] as CSSUnit,
      } as const;
    }
    return { value: 0, unit: 'px' } as const; // Default to 0px if parsing fails
  });

  return paddingValues;
}

function useShadowElement(element: HTMLElement): HTMLElement | null {
  if (!element) return null;

  // Check if the element is either a WZ-TAB or WZ-CARD
  if (element.tagName !== 'WZ-TAB' && element.tagName !== 'WZ-CARD')
    return null;

  const shadowRoot = element.shadowRoot;
  if (!shadowRoot) return null;

  // Select the appropriate container based on the element type
  const selector = element.tagName === 'WZ-TAB' ? '.wz-tab' : '.wz-card';
  const container: HTMLElement = shadowRoot.querySelector(selector);
  if (!container) return null;

  return container;
}
