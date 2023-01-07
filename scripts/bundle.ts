import asar from "@electron/asar";
import { readFileSync } from "fs";
import { PluginManifest } from "replugged/dist/types/addon";

const manifest = JSON.parse(readFileSync("manifest.json", "utf-8")) as PluginManifest;
const outputName = `${manifest.id}.asar`;

asar.createPackage("dist", outputName);
