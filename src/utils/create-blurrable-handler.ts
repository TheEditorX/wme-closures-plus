import { SyntheticEvent } from 'react';

export function createBlurrableHandler<T extends HTMLElement, E extends Event>(
  handler: (e: SyntheticEvent<T, E>) => void,
): (e: SyntheticEvent<T, E>) => void {
  return (e) => {
    // Blur the element to prevent focus retaining
    const target = e.currentTarget;
    target.blur();

    // Call (and return) the original handler
    return handler?.(e);
  };
}
