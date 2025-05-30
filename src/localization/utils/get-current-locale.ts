import { getWindow } from '../../utils/window-utils';

export function getCurrentLocale(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { I18n } = getWindow<{ I18n: any }>();

  return I18n.currentLocale?.() ?? 'en';
}
