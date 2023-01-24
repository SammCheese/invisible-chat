import esbuild from "esbuild";
import path, { join } from "path";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import _manifest from "../manifest.json";
import { PluginManifest } from "replugged/dist/types/addon";

const manifest: PluginManifest = _manifest;
const watch = process.argv.includes("--watch");
const CHROME_VERSION = "91";
const REPLUGGED_FOLDER_NAME = "replugged";

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
      if (!process.argv.includes("--no-install")) {
        const dest = join(CONFIG_PATH, "plugins", manifest.id);
        if (existsSync(dest)) rmSync(dest, { recursive: true });
        cpSync("dist", dest, { recursive: true });
        console.log("Installed updated version");
      }
    });
  },
};

const common: esbuild.BuildOptions = {
  absWorkingDir: path.join(__dirname, ".."),
  bundle: true,
  format: "esm" as esbuild.Format,
  logLevel: "info",
  minify: true,
  platform: "browser",
  plugins: [globalModules, install],
  sourcemap: false,
  target: `chrome${CHROME_VERSION}`,
  watch,
};

const targets = [];

if ("renderer" in manifest) {
  targets.push(
    esbuild.build({
      ...common,
      entryPoints: [manifest.renderer],
      outfile: "dist/renderer.js",
    }),
  );

  manifest.renderer = "renderer.js";
}

if ("plaintextPatches" in manifest) {
  targets.push(
    esbuild.build({
      ...common,
      entryPoints: [manifest.plaintextPatches],
      outfile: "dist/plaintextPatches.js",
    }),
  );

  manifest.plaintextPatches = "plaintextPatches.js";
}

if (!existsSync("dist")) mkdirSync("dist");

writeFileSync("dist/manifest.json", JSON.stringify(manifest));

Promise.all(targets);
