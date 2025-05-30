import { getWindow } from '../../utils/window-utils';

export function loadStrings(locale: string, strings: object): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { I18n } = getWindow<{ I18n: any }>();

  I18n.translations[locale] = {
    ...I18n.translations[locale],
    ...strings,
  };
}
