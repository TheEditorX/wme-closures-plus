import axios from 'axios';
import Logger from 'js-logger';
import { createRoot } from 'react-dom/client';
import { SessionId } from './consts/session-id';
import { getCurrentLocale, loadCrowdinStrings } from './localization';
import fallbackStrings from './localization/static/userscript.json';
import { axiosGmXhrAdapter } from './tampermonkey/axios-gmxhr-adapter';
import { getWmeSdk, SDK_INITIALIZED } from './utils/sdk-utils';
import { App } from './App';
import { asScriptTab } from 'utils/as-script-tab';
import { createElement } from 'react';
import PlusBranded from './assets/plus-branded.svg';

import './utils/wme-date-format';

const consoleLogger = (() => {
  let lastConsoleOutput = NaN;

  return Logger.createDefaultHandler({
    formatter: (messages, context) => {
      const currentTime = new Date();
      const timeSinceLastMessage = currentTime.getTime() - lastConsoleOutput;
      messages.unshift(
        [
          '[editorx.dev/closures-plus]',
          currentTime.toISOString(),
          !isNaN(timeSinceLastMessage) &&
            `\x1B[32m+${timeSinceLastMessage}ms\x1B[m`,
          context.name && `[\x1B[105;1m${context.name}\x1B[m]`,
        ]
          .filter(Boolean)
          .join('\t'),
      );
      lastConsoleOutput = currentTime.getTime();
    },
  });
})();
Logger.setHandler((messages, context) => {
  consoleLogger(messages, context);
});

Logger.setLevel(Logger.DEBUG);
Logger.debug('Logger initialized.');
Logger.debug('Starting session', { sessionId: SessionId });

axios.defaults.adapter = axiosGmXhrAdapter;

const [wmeSdk] = await Promise.all([
  await (async () => {
    Logger.debug('Waiting for SDK to initialize...');
    await SDK_INITIALIZED;
    const wmeSdk = await initWmeSdkPlus(
      getWmeSdk({
        scriptId: __SCRIPT_ID__,
        scriptName: __SCRIPT_NAME__,
      }),
    );
    Logger.debug('SDK initialized.', {
      username: wmeSdk.State.getUserInfo()?.userName,
      userRank: wmeSdk.State.getUserInfo()?.rank,
    });
    return wmeSdk;
  })(),
  await loadCrowdinStrings(
    getCurrentLocale(),
    process.env.CROWDIN_DISTRIBUTION_HASH,
    fallbackStrings,
    process.env.LOCALIZATION_PREFIX,
  ),
]);

Logger.debug('Starting app...');
const root = createRoot(document.createDocumentFragment());
const AppWrapper = asScriptTab(
  App,
  <>
    {__SCRIPT_SHORT_NAME__.endsWith('+') ?
      __SCRIPT_SHORT_NAME__.substring(0, __SCRIPT_SHORT_NAME__.length - 1)
    : __SCRIPT_SHORT_NAME__}

    <PlusBranded
      style={{ verticalAlign: 'middle', transform: 'translateY(-10%)' }}
    />
  </>,
);

root.render(
  createElement(AppWrapper, {
    wmeSdk,
  }),
);

Logger.debug('Rendered. Idle');
