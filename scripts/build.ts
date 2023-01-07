import esbuild from "esbuild";
import path, { join } from "path";
import fs, { existsSync, rmSync } from "fs";
import _manifest from "../manifest.json";
import { PluginManifest } from "replugged/dist/types/addon";

const manifest: PluginManifest = _manifest;

const NODE_VERSION = "14";
const CHROME_VERSION = "91";

const globalModules: esbuild.Plugin = {
  name: "globalModules",
  setup: (build) => {
    build.onResolve({ filter: /^replugged.+$/ }, (args) => {
      if (args.kind !== "import-statement") return;

      return {
        errors: [
          {
            text: `Importing from a path (${args.path}) is not supported. Instead, please import from "replugged" and destructure the required modules.`,
          },
        ],
      };
    });

    build.onResolve({ filter: /^replugged$/ }, (args) => {
      if (args.kind !== "import-statement") return;

      return {
        path: args.path,
        namespace: "replugged",
      };
    });

    build.onLoad(
      {
        filter: /.*/,
        namespace: "replugged",
      },
      () => {
        return {
          contents: "module.exports = window.replugged",
        };
      },
    );
  },
};

const REPLUGGED_FOLDER_NAME = "replugged";
export const CONFIG_PATH = (() => {
  switch (process.platform) {
    case "win32":
      return join(process.env.APPDATA || "", REPLUGGED_FOLDER_NAME);
    case "darwin":
      return join(process.env.HOME || "", "Library", "Application Support", REPLUGGED_FOLDER_NAME);
    default:
      if (process.env.XDG_CONFIG_HOME) {
        return join(process.env.XDG_CONFIG_HOME, REPLUGGED_FOLDER_NAME);
      }
      return join(process.env.HOME || "", ".config", REPLUGGED_FOLDER_NAME);
  }
})();

const install: esbuild.Plugin = {
  name: "install",
  setup: (build) => {
    build.onEnd(() => {
      if (!process.env.NO_INSTALL) {
        const dest = join(CONFIG_PATH, "plugins", manifest.id);
        if (existsSync(dest)) {
          rmSync(dest, { recursive: true });
        }
        fs.cpSync("dist", dest, { recursive: true });
        console.log("Installed updated version");
      }
    });
  },
};

const watch = process.argv.includes("--watch");

const common: esbuild.BuildOptions = {
  absWorkingDir: path.join(__dirname, ".."),
  bundle: true,
  minify: true,
  sourcemap: false,
  format: "cjs" as esbuild.Format,
  logLevel: "info",
  watch,
  plugins: [install],
};

const targets = [];

if ("renderer" in manifest) {
  targets.push(
    esbuild.build({
      ...common,
      entryPoints: [manifest.renderer],
      platform: "browser",
      target: `chrome${CHROME_VERSION}`,
      outfile: "dist/renderer.js",
      format: "esm" as esbuild.Format,
      plugins: [globalModules, install],
    }),
  );

  manifest.renderer = "renderer.js";
}

if ("preload" in manifest) {
  targets.push(
    esbuild.build({
      ...common,
      entryPoints: [manifest.preload],
      platform: "node",
      target: [`node${NODE_VERSION}`, `chrome${CHROME_VERSION}`],
      outfile: "dist/preload.js",
      external: ["electron"],
    }),
  );

  manifest.preload = "preload.js";
}

if ("main" in manifest) {
  targets.push(
    esbuild.build({
      ...common,
      entryPoints: [manifest.main],
      platform: "node",
      target: `node${NODE_VERSION}`,
      outfile: "dist/main.js",
      external: ["electron"],
    }),
  );

  manifest.main = "main.js";
}

if ("plaintextPatches" in manifest) {
  targets.push(
    esbuild.build({
      ...common,
      entryPoints: [manifest.plaintextPatches],
      platform: "browser",
      target: `chrome${CHROME_VERSION}`,
      outfile: "dist/plaintextPatches.js",
      format: "esm" as esbuild.Format,
      plugins: [globalModules, install],
    }),
  );

  manifest.plaintextPatches = "plaintextPatches.js";
}

if (!fs.existsSync("dist")) {
  fs.mkdirSync("dist");
}

fs.writeFileSync("dist/manifest.json", JSON.stringify(manifest));

Promise.all(targets);
