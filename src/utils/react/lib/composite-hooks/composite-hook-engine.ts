import type { AnyHook } from '../parse-fiber-hooks';
import type { AnyCompositeHook, CompositeHookMatcher } from './composite-hook';
import { zustandUseStoreMatcher } from './zustand-use-store-matcher';

export class CompositeHookEngine {
  private readonly matchers: CompositeHookMatcher<AnyCompositeHook>[];

  constructor(
    matchers: ReadonlyArray<CompositeHookMatcher<AnyCompositeHook>> = [],
  ) {
    this.matchers = [...matchers];
  }

  register<T extends AnyCompositeHook>(matcher: CompositeHookMatcher<T>): this {
    this.matchers.push(matcher as CompositeHookMatcher<AnyCompositeHook>);
    return this;
  }

  parse(hooks: AnyHook[]): (AnyHook | AnyCompositeHook)[] {
    const result: (AnyHook | AnyCompositeHook)[] = [];
    let i = 0;

    while (i < hooks.length) {
      let matched = false;

      for (const matcher of this.matchers) {
        const matchResult = matcher.match(hooks, i);
        if (matchResult && matchResult.consumed > 0) {
          result.push(matchResult.hook);
          i += matchResult.consumed;
          matched = true;
          break;
        }
      }

      if (!matched) {
        result.push(hooks[i]);
        i++;
      }
    }

    return result;
  }
}

export const defaultCompositeHookEngine = new CompositeHookEngine([
  zustandUseStoreMatcher,
]);

export function parseCompositeHooks(
  hooks: AnyHook[],
  matchers?: CompositeHookMatcher<AnyCompositeHook>[],
): (AnyHook | AnyCompositeHook)[] {
  if (!matchers) {
    return defaultCompositeHookEngine.parse(hooks);
  }
  return new CompositeHookEngine(matchers).parse(hooks);
}
