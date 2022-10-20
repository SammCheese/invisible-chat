import esbuild from 'esbuild';
import { globalExternals } from '@fal-works/esbuild-plugin-global-externals';
import path from 'path';
import type { Plugin } from 'replugged/src/types/addon';
import fs from 'fs';
import _manifest from '../manifest.json';

const manifest: Plugin = _manifest;

const NODE_VERSION = '14';
const CHROME_VERSION = '91';

const globalModules = {
  replugged: {
    varName: "replugged",
    namedExports: ["injector", "webpack", "notices", "commands", "settings", "quickCSS", "themes", "ignition", "plugins"],
    defaultExport: true
  }
}

const watch = process.argv.includes('--watch');

const common: esbuild.BuildOptions = {
  absWorkingDir: path.join(__dirname, '..'),
  bundle: true,
  minify: false,
  sourcemap: true,
  format: 'cjs' as esbuild.Format,
  logLevel: 'info',
  watch
};

const targets = [];

if ('renderer' in manifest) {
  targets.push(
    esbuild.build({
      ...common,
      entryPoints: [ manifest.renderer ],
      platform: 'browser',
      target: `chrome${CHROME_VERSION}`,
      outfile: 'dist/renderer.js',
      format: 'esm' as esbuild.Format,
      plugins: [globalExternals(globalModules)]
    })
  );

  manifest.renderer = 'renderer.js';
}

if ('preload' in manifest) {
  targets.push(
    esbuild.build({
      ...common,
      entryPoints: [ manifest.preload ],
      platform: 'node',
      target: [ `node${NODE_VERSION}`, `chrome${CHROME_VERSION}` ],
      outfile: 'dist/preload.js',
      external: [ 'electron' ]
    })
  );

  manifest.preload = 'preload.js';
}

if ('main' in manifest) {
  targets.push(
    esbuild.build({
      ...common,
      entryPoints: [ manifest.main ],
      platform: 'node',
      target: `node${NODE_VERSION}`,
      outfile: 'dist/main.js',
      external: [ 'electron' ]
    })
  );

  manifest.main = 'main.js';
}

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest));

Promise.all(targets);
