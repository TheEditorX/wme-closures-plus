import Logger from 'js-logger';
import { fetchRemoteStrings } from './fetch-remote-strings';
import { loadStrings } from './load-strings';

const logger = Logger.get('i18n');

export async function loadCrowdinStrings(
  locale: string,
  distributionHash: string,
  fallbackStrings?: object,
  prefix?: string,
): Promise<void> {
  logger.debug(`Loading strings from crowdin`, {
    distributionHash,
    locale,
  });

  let strings = await fetchRemoteStrings(
    distributionHash,
    locale,
    fallbackStrings,
  );
  if (prefix) strings = { [prefix]: strings };
  loadStrings(locale, strings);
}
