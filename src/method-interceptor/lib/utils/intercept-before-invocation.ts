import { KeysOfFunctions } from '../keys-of-type.js';
import { InterceptionFunction } from '../method-interceptor.js';

export const CONTINUE_INVOCATION: unique symbol = Symbol('CONTINUE INVOCATION');

export function interceptBeforeInvocation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Target extends Record<string, (...args: any[]) => any>,
  FnKey extends KeysOfFunctions<Target>,
>(
  invocator: (
    this: ThisType<Target[FnKey]>,
    ...args: Parameters<Target[FnKey]>
  ) => ReturnType<Target[FnKey]> | typeof CONTINUE_INVOCATION,
): InterceptionFunction<Target, FnKey> {
  return function (invoke, ...args) {
    const customInvocatorResult = invocator.apply(this, args);
    if (customInvocatorResult !== CONTINUE_INVOCATION)
      return customInvocatorResult;

    return invoke(...args);
  };
}
