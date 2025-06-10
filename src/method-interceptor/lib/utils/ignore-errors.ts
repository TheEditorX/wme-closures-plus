/* eslint-disable @typescript-eslint/no-explicit-any */

export function ignoreErrors<
  Fn extends (...args: any[]) => any,
  V extends ReturnType<Fn> = ReturnType<Fn>,
>(cb: Fn, defaultValue?: V): V | undefined {
  try {
    return cb();
  } catch {
    return defaultValue;
  }
}
