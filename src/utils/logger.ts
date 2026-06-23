import { LogStream } from '@editor-x/wme-logstream';

const scriptId = typeof __SCRIPT_ID__ !== 'undefined' ? __SCRIPT_ID__ : 'wme-closures-plus';
const scriptVersion = typeof __SCRIPT_VERSION__ !== 'undefined' ? __SCRIPT_VERSION__ : '1.0.0';

export const logger = LogStream.create({
  minLogLevel: 'DEBUG',
  persist: true,
  dbPrefix: scriptId.replace('/', '-'),
  scriptVersion: scriptVersion,
  brand: {
    scriptPrefix: 'editorx.dev/closures-plus',
  },
});
