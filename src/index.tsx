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
import PlusBranded from './assets/plus-branded.svg';
import { WzMenuElement } from 'types/waze/elements';

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
Logger.debug('Starting session', {
  sessionId: SessionId,
  version: __SCRIPT_VERSION__,
  buildTime: __BUILD_TIME__,
  browserInfo: {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  },
  initialUrl: window.location.href,
});

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
      wazeMapEditorInfo: {
        version: wmeSdk.getWMEVersion(),
        sdkVersion: wmeSdk.getSDKVersion(),
        isBetaEnv: wmeSdk.isBetaEnvironment(),
      },
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
  <AppWrapper
    wmeSdk={wmeSdk}
    tabLabelEffect={(tabLabelElement) => {
      let clickCount = 0;
      let lastClickTime = 0;
      const CLICK_TIMEOUT = 3000;

      const sendLogs = () => {
        Logger.debug('Sending logs...');

        // Collect browser and environment information
        const browserInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
        };

        // Create a text blob with logs
        const logData = {
          sessionId: SessionId,
          timestamp: new Date().toISOString(),
          userInfo: wmeSdk.State.getUserInfo(),
          browserInfo,
          content: null,
        };

        const logBlob = new Blob([JSON.stringify(logData, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(logBlob);

        // Create a download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `wme-closures-plus-logs-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

        Logger.debug('Logs sent');
      };

      const handleContextMenu = (event: MouseEvent) => {
        const currentTime = Date.now();

        // Check if the click is within the timeout period
        if (currentTime - lastClickTime > CLICK_TIMEOUT) {
          // Reset if timeout exceeded
          clickCount = 0;
        }

        clickCount++;
        lastClickTime = currentTime;


        if (clickCount === 5) {
          Logger.debug('Context menu triggered', { event });
          // Prevent default context menu on third click
          event.preventDefault();

          // Reset counter
          clickCount = 0;

          // Create wz-menu element if it doesn't exist
          let menu = document.querySelector(
            'wz-menu#editorx-wme-closures-plus-debug-menu',
          ) as WzMenuElement;
          if (!menu) {
            menu = document.createElement('wz-menu') as WzMenuElement;
            menu.id = 'editorx-wme-closures-plus-debug-menu';
            menu.setAttribute('fixed', 'true');

            // Create menu items
            const downloadLogsItem = document.createElement('wz-menu-item');
            downloadLogsItem.innerHTML = 'Download Logs';
            downloadLogsItem.addEventListener('click', sendLogs);

            // Add divider before version info
            const divider = document.createElement('wz-menu-divider');

            // Create debug info item (non-clickable)
            const debugInfoItem = document.createElement('div');
            debugInfoItem.style.padding =
              'var(--wz-menu-option-padding, var(--space-always-s, 12px))';
            debugInfoItem.style.minHeight =
              'var(--wz-menu-option-height, var(--wz-option-height, 40px))';
            debugInfoItem.innerHTML = `
              <wz-overline>${__SCRIPT_SHORT_NAME__} Debug Menu</wz-overline>
              <div style="display: flex; flex-direction: column">
                <wz-caption>Version: ${__SCRIPT_VERSION__}</wz-caption>
                <wz-caption>Build time: ${__BUILD_TIME__}</wz-caption>
              </div>
            `;

            // Add items to menu
            menu.appendChild(downloadLogsItem);
            menu.appendChild(divider);
            menu.appendChild(debugInfoItem);

            // Add menu to document
            document.body.appendChild(menu);
          }

          menu.showMenu(event);
        }
      };

      tabLabelElement.addEventListener('pointerup', handleContextMenu);

      // Return cleanup function
      return () => {
        tabLabelElement.removeEventListener('pointerup', handleContextMenu);

        // Remove the menu element if it exists
        const menu = document.querySelector(
          'wz-menu#editorx-wme-closures-plus-debug-menu',
        );
        if (menu && menu.parentNode) {
          menu.parentNode.removeChild(menu);
        }
      };
    }}
  />,
);

Logger.debug('Rendered. Idle');
