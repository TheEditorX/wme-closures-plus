import { isInstance } from './is-instance';

export function deepMerge<T>(target: T, ...sources: Partial<T>[]): T {
  for (const source of sources) {
    for (const key in source) {
      if (source[key] instanceof Object && !Array.isArray(source[key])) {
        if (!target[key] || isInstance(target[key]) || isInstance(source[key]))
          target[key] = source[key];
        else deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}
