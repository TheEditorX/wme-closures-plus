import { deepMerge } from '../../utils';
import { CrowdinOtaClient } from '../crowdin-ota';

const clientsMap = new Map<string, CrowdinOtaClient>();

function getClient(distributionHash: string): CrowdinOtaClient {
  if (clientsMap.has(distributionHash))
    return clientsMap.get(distributionHash)!;

  const client = new CrowdinOtaClient(distributionHash);
  clientsMap.set(distributionHash, client);
  return client;
}

export async function fetchRemoteStrings(
  distributionHash: string,
  locale: string,
  fallbackStrings?: object,
): Promise<object> {
  const client = getClient(distributionHash);
  const localedStrings = await client.getStringsByLocale(locale);
  if (!fallbackStrings) return localedStrings;

  return deepMerge({}, fallbackStrings, localedStrings);
}
