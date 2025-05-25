import { SyntheticEvent } from 'react';

export function createBlurrableHandler<
  T extends HTMLElement,
  E extends Event,
  R = void,
>(handler: (e: SyntheticEvent<T, E>) => R): (e: SyntheticEvent<T, E>) => R {
  return (e) => {
    // Blur the element to prevent focus retaining
    const target = e.currentTarget;
    target.blur();

    // Call (and return) the original handler
    return handler?.(e);
  };
}
