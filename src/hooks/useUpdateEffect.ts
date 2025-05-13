/* eslint-disable react-hooks/exhaustive-deps */

import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return effect();
  }, deps);
}
