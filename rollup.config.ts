import json from '@rollup/plugin-json';
import convertStringConvention from './convert-string-convention';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import addBanner from './rollup-plugin-add-banner';
import svgr from '@svgr/rollup';

import packageMetadata from './package.json';

const packageName = packageMetadata.name;
const packageNamespace =
  packageName.startsWith('@') && packageName.includes('/') ?
    packageName.substring(0, packageName.indexOf('/'))
  : null;
const packagePureName =
  packageNamespace ?
    packageName.substring(packageName.indexOf('/') + 1)
  : packageName;
const packageAuthor =
  ('author' in packageMetadata &&
    typeof packageMetadata.author === 'string' &&
    packageMetadata.author) ||
  packageNamespace?.substring(1) ||
  'Unknown';

const scriptName =
  ('displayName' in packageMetadata &&
    typeof packageMetadata.displayName === 'string' &&
    packageMetadata.displayName) ||
  convertStringConvention(packagePureName, 'Space Case');
const shortScriptName =
  ('shortDisplayName' in packageMetadata &&
    typeof packageMetadata.shortDisplayName === 'string' &&
    packageMetadata.shortDisplayName) ||
  scriptName;

function transformSourcemapPath(path: string): string {
  const topLevelPath = path.replace(/^(\.\.\/)*/, '');
  return `userscript:///${packageAuthor}/${packagePureName}/${topLevelPath}`;
}

export default {
  input: 'src/index.tsx',
  output: [
    {
      format: 'es',
      inlineDynamicImports: true,
      file: `dist/${packagePureName}.user.js`,
      sourcemap: false,
      sourcemapPathTransform: transformSourcemapPath,
    },
    {
      format: 'es',
      inlineDynamicImports: true,
      file: `dist/${packagePureName}.min.user.js`,
      sourcemap: false,
      sourcemapPathTransform: transformSourcemapPath,
      plugins: [terser({ mangle: false })],
    },
  ],
  plugins: [
    svgr(),
    json(),
    typescript({
      exclude: ['**/*.spec.ts', '**/*.spec.tsx'],
    }),
    commonjs(),
    resolve({ browser: true }),
    replace({
      preventAssignment: true,
      delimiters: ['\\b', '\\b'],
      'process.env.NODE_ENV': JSON.stringify('production'),
      __SCRIPT_ID__: JSON.stringify(`${packageAuthor}/${packagePureName}`),
      __SCRIPT_AUTHOR__: JSON.stringify(packageAuthor),
      __SCRIPT_NAME__: JSON.stringify(scriptName),
      __SCRIPT_SHORT_NAME__: JSON.stringify(shortScriptName),
      __SCRIPT_CAMEL_CASE_NAME__: JSON.stringify(
        convertStringConvention(packagePureName, 'PascalCase'),
      ),
      __SCRIPT_VERSION__: JSON.stringify(packageMetadata.version),
      __BUILD_TIME__: JSON.stringify(new Date()),
      'process.env.CROWDIN_DISTRIBUTION_HASH': JSON.stringify(
        process.env.CROWDIN_DISTRIBUTION_HASH || '15dd9243e7c0c5a4cad8d58031c',
      ),
      'process.env.LOCALIZATION_PREFIX': JSON.stringify(
        process.env.LOCALIZATION_PREFIX ||
          `${packageAuthor}/${packagePureName}`,
      ),
    }),
    addBanner({ file: 'tampermonkey.meta.js' }),
  ],
};
