import { useMemo } from 'react';
import { getWindow } from '../utils/window-utils';

export function useTranslation(defaultPrefix?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { I18n } = getWindow<{ I18n: any }>();

  const prefix = defaultPrefix ?? process.env.LOCALIZATION_PREFIX;

  return useMemo(() => {
    const translate = (key: string, params?: object) => {
      if (!key) return '';
      return I18n.t(key, params);
    };

    return {
      t(key: string, params?: object): string {
        if (!key) return '';
        const fullKey = prefix ? `${prefix}.${key}` : key;
        return translate(fullKey, params);
      },
      unsafeT(key: string, params?: object): string {
        if (!key) return '';
        return translate(key, params);
      },
    };
  }, [I18n, prefix]);
}
