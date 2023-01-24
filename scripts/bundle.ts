import asar from "@electron/asar";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { PluginManifest } from "replugged/dist/types/addon";

const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf-8")) as PluginManifest;
const outputName = `bundle/${manifest.id}`;

if (!existsSync("bundle")) {
  mkdirSync("bundle");
}
asar.createPackage("dist", `${outputName}.asar`);
copyFileSync("dist/manifest.json", `${outputName}.json`);
