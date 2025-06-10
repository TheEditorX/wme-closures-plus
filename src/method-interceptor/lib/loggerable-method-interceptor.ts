import { FunctionOfTarget, KeysOfFunctions } from './keys-of-type.js';
import {
  InterceptionFunction,
  MethodInterceptor,
} from './method-interceptor.js';
import { ignoreErrors } from './utils/ignore-errors.js';

export class LoggerableMethodInterceptor<
  Target extends object,
  FnKey extends KeysOfFunctions<Target>,
> extends MethodInterceptor<Target, FnKey> {
  private _loggedInvocationRequests: Parameters<
    FunctionOfTarget<Target, FnKey>
  >[] = [];

  constructor(
    targetObject: Target,
    functionName: FnKey,
    interceptionFunction: InterceptionFunction<Target, FnKey>,
  ) {
    super(targetObject, functionName, interceptionFunction);
    this.registerMiddleware((...args) => this.logRequest(...args));
  }

  logRequest(...args: Parameters<FunctionOfTarget<Target, FnKey>>) {
    this._loggedInvocationRequests.push(args);
  }

  flushLoggedRequests() {
    const requests = this.getLoggedRequests();
    this._loggedInvocationRequests = [];
    return requests;
  }

  getLoggedRequests() {
    return this._loggedInvocationRequests;
  }

  executeOriginalLoggedRequests() {
    const requests = this.flushLoggedRequests();
    requests.forEach((request) =>
      ignoreErrors(() => this.callOriginalInvocator(...request)),
    );
  }
}
