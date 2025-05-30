import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { getCurrentLocale, loadCrowdinStrings } from './localization';
import fallbackStrings from './localization/static/userscript.json';
import { axiosGmXhrAdapter } from './tampermonkey/axios-gmxhr-adapter';
import { getWmeSdk, SDK_INITIALIZED } from './utils/sdk-utils';
import { App } from './App';
import { asScriptTab } from 'utils/as-script-tab';
import { createElement } from 'react';
import PlusBranded from './assets/plus-branded.svg';

import './utils/wme-date-format';

axios.defaults.adapter = axiosGmXhrAdapter;

const [wmeSdk] = await Promise.all([
  await (async () => {
    await SDK_INITIALIZED;
    return await initWmeSdkPlus(
      getWmeSdk({
        scriptId: __SCRIPT_ID__,
        scriptName: __SCRIPT_NAME__,
      }),
    );
  })(),
  await loadCrowdinStrings(
    getCurrentLocale(),
    process.env.CROWDIN_DISTRIBUTION_HASH,
    fallbackStrings,
    process.env.LOCALIZATION_PREFIX,
  ),
]);

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
