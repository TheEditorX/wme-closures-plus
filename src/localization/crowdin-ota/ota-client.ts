import { createCrowdinAxiosClient } from './internal/http/axios-client';
import { isJsonFile, mergeDeep } from './internal/util/strings';
import {
  ClientConfig,
  HttpClient,
  LanguageStrings,
  LanguageTranslations,
  Manifest,
  Translations,
} from './model';

/**
 * @category OtaClient
 */
export class CrowdinOtaClient {
  /** @internal */
  public static readonly BASE_URL = 'https://distributions.crowdin.net';

  private readonly httpClient: HttpClient;

  private manifestHolder?: Promise<Manifest>;
  private disableManifestCache = false;

  private stringsCache: { [file: string]: Promise<object | string> } = {};
  private disableStringsCache = false;

  private disableJsonDeepMerge = false;
  private locale?: string;

  /**
   * @param distributionHash hash of released Crowdin project distribution
   * @param config client config
   */
  constructor(
    private distributionHash: string,
    config?: ClientConfig,
  ) {
    this.httpClient = config?.httpClient || createCrowdinAxiosClient();
    this.disableManifestCache = !!config?.disableManifestCache;
    this.locale = config?.languageCode;
    this.disableStringsCache = !!config?.disableStringsCache;
    this.disableJsonDeepMerge = !!config?.disableJsonDeepMerge;
  }

  /**
   * Get the distribution hash
   *
   * @category Helper
   */
  getHash(): string {
    return this.distributionHash;
  }

  /**
   * Define the global language for the client instance.
   * Default language code to be used if language was not passed as an input argument of the method
   *
   * @param languageCode {@link https://developer.crowdin.com/language-codes Language Code}
   * @category Helper
   */
  setCurrentLocale(languageCode?: string): void {
    this.locale = languageCode;
  }

  /**
   * Get the current locale
   *
   * @category Helper
   */
  getCurrentLocale(): string | undefined {
    return this.locale;
  }

  /**
   * Get manifest timestamp of distribution
   *
   * @category Helper
   */
  async getManifestTimestamp(): Promise<number> {
    return (await this.manifest).timestamp;
  }

  /**
   * List distribution's files content
   *
   * @category Content Management
   */
  async getContent(): Promise<Manifest['content']> {
    return (await this.manifest).content;
  }

  /**
   * List distribution's files content for a specific language
   *
   * @param languageCode {@link https://developer.crowdin.com/language-codes Language Code}
   *
   * @category Content Management
   */
  async getLanguageContent(languageCode?: string): Promise<string[]> {
    const language = this.getLanguageCode(languageCode);
    const content = await this.getContent();
    return content[language];
  }

  /**
   * List Crowdin project language codes
   *
   * @category Helper
   */
  async listLanguages(): Promise<string[]> {
    return Object.keys(await this.getContent());
  }

  /**
   * Returns all translations per each language code
   *
   * @category Content Management
   */
  async getTranslations(): Promise<Translations> {
    const languages = await this.listLanguages();
    const translations: Translations = {};
    await Promise.all(
      languages.map(async (language) => {
        translations[language] = await this.getLanguageTranslations(language);
      }),
    );
    return translations;
  }

  /**
   * Returns translations for each file in the distribution for a given language
   *
   * @param languageCode {@link https://developer.crowdin.com/language-codes Language Code}
   *
   * @category Content Management
   */
  async getLanguageTranslations(
    languageCode?: string,
  ): Promise<LanguageTranslations[]> {
    const language = this.getLanguageCode(languageCode);
    const content = await this.getContent();
    const files = content[language] || [];
    return Promise.all(
      files.map(async (file) => {
        const content = await this.getFileTranslations(file);
        return { content, file };
      }),
    );
  }

  /**
   * Returns translations for a specific file (content)
   *
   * @param file file content path
   *
   * @category Content Management
   */
  async getFileTranslations(file: string): Promise<string | object | null> {
    const content = await this.getContent();
    const fileExists = Object.values(content).some((files) =>
      files.includes(file),
    );
    if (!fileExists) {
      throw new Error(`File ${file} does not exists in manifest content`);
    }
    const timestamp = await this.getManifestTimestamp();
    const url = `${CrowdinOtaClient.BASE_URL}/${this.distributionHash}${file}?timestamp=${timestamp}`;
    return this.httpClient.get<string | object>(url).catch(() => null);
  }

  /**
   * Returns translation strings from json-based files for all languages
   *
   * @category Strings Management
   */
  async getStrings(): Promise<LanguageStrings> {
    const content = await this.getJsonFiles();
    const res: LanguageStrings = {};
    await Promise.all(
      Object.entries(content).map(async ([lang, files]) => {
        res[lang] = await this.getStringsByFilesAndLocale(files);
      }),
    );
    return res;
  }

  /**
   * Returns translation strings from json-based files for a given language
   *
   * @param languageCode {@link https://developer.crowdin.com/language-codes Language Code}
   *
   * @category Strings Management
   */
  async getStringsByLocale(languageCode?: string): Promise<object> {
    const language = this.getLanguageCode(languageCode);
    const content = await this.getJsonFiles();
    return this.getStringsByFilesAndLocale(content[language] || []);
  }

  /**
   * Returns translation string for language for given key
   *
   * @param key path to the translation string in json file
   * @param languageCode {@link https://developer.crowdin.com/language-codes Language Code}
   *
   * @category Strings Management
   */
  async getStringByKey(
    key: string[] | string,
    languageCode?: string,
  ): Promise<string | object> {
    const strings = await this.getStringsByLocale(languageCode);
    const path = Array.isArray(key) ? key : [key];
    const firstKey = path.shift();
    if (!firstKey) {
      return undefined;
    }
    let res = strings[firstKey];
    for (const keyPart of path) {
      res = res?.[keyPart];
    }
    return res;
  }

  /**
   * Clear the translation string cache
   *
   * @category Helper
   */
  clearStringsCache(): void {
    this.stringsCache = {};
  }

  private async getStringsByFilesAndLocale(files: string[]): Promise<object> {
    let strings = {};
    for (const filePath of files) {
      let content;
      if (this.stringsCache[filePath]) {
        content = await this.stringsCache[filePath];
      } else {
        if (!this.disableStringsCache) {
          this.stringsCache[filePath] = this.getFileTranslations(filePath);
        }
        content = await this.stringsCache[filePath];
      }
      if (this.disableJsonDeepMerge) {
        strings = { ...strings, ...content };
      } else {
        mergeDeep(strings, content);
      }
    }
    return strings;
  }

  private get manifest(): Promise<Manifest> {
    if (this.manifestHolder && !this.disableManifestCache) {
      return this.manifestHolder;
    } else {
      this.manifestHolder = this.httpClient
        .get(
          `${CrowdinOtaClient.BASE_URL}/${this.distributionHash}/manifest.json`,
        )
        .then((manifest: Manifest) => {
          if (manifest.language_mapping) {
            Object.keys(manifest.language_mapping).forEach(
              (crowdinLangCode) => {
                const mapping = manifest.language_mapping[crowdinLangCode];
                // if the mapping has a different locale code, then update the content locale codes as well
                if (
                  Object.prototype.hasOwnProperty.call(mapping, 'locale') &&
                  Object.prototype.hasOwnProperty.call(
                    manifest.content,
                    crowdinLangCode,
                  )
                ) {
                  manifest.content[mapping.locale] =
                    manifest.content[crowdinLangCode];
                  delete manifest.content[crowdinLangCode];
                }
              },
            );
          }
          return manifest;
        });
      return this.manifestHolder;
    }
  }

  private getLanguageCode(lang?: string): string {
    const languageCode = lang || this.getCurrentLocale();
    if (languageCode) {
      return languageCode;
    } else {
      throw new Error(
        'Language code should be either provided through input arguments or by "setCurrentLocale" method',
      );
    }
  }

  private async getJsonFiles(): Promise<Manifest['content']> {
    const content = await this.getContent();
    const res: Manifest['content'] = {};
    Object.entries(content).forEach(
      ([lang, files]) => (res[lang] = files.filter(isJsonFile)),
    );
    return res;
  }
}
