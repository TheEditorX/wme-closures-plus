import { fetchRemoteStrings } from './fetch-remote-strings';
import { loadStrings } from './load-strings';

export async function loadCrowdinStrings(
  locale: string,
  distributionHash: string,
  fallbackStrings?: object,
  prefix?: string,
): Promise<void> {
  debugger;
  let strings = await fetchRemoteStrings(
    distributionHash,
    locale,
    fallbackStrings,
  );
  if (prefix) strings = { [prefix]: strings };
  loadStrings(locale, strings);
}
