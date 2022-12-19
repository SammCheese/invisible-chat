import { createWriteStream } from "fs";
import { get } from "https";
import { plugins } from "replugged";
import { CONFIG_PATHS } from "replugged/dist/util";
import { join } from "path";

const GITAPI_LINK = "https://api.github.com/repos/SammCheese/invisible-chat/releases/latest";
const FILENAME = "dev.sammcheese.InvisibleChat.asar";

async function fetchGithub(): Promise<JSON> {
  return new Promise((resolve, reject) => {
    fetch(GITAPI_LINK)
      .then((resp) => resolve(resp.json()))
      .catch((rej) => {
        console.log(rej);
        reject(rej);
      });
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const downloadFile = (url: string, path: string) => {
  const file = createWriteStream(path);
  get(url, (res) => {
    res.pipe(file);

    file.on("finish", () => {
      file.close();
    });
  });
};

export async function checkUpdate(): Promise<void> {
  const gitResult = await fetchGithub();
  // @ts-expect-error response type not declared
  const localVersion = await plugins.get("dev.sammcheese.InvisibleChat")?.manifest?.version;

  // @ts-expect-error type not declared
  if (isNewAvailable(localVersion, gitResult.tag_name)) {
    // @ts-expect-error type not declared
    downloadFile(gitResult.assets.browser_download_url, join(CONFIG_PATHS.plugins, FILENAME));
    /*rename(join(CONFIG_PATHS.plugins, FILENAME), `${FILENAME}.update`, (e) => {
      // @ts-expect-error type not declared
      if (e) unlinkSync(file);
    });*/
  }
}

function isNewAvailable(localVersion: string, remoteVersion: string): boolean {
  if (!localVersion || !remoteVersion) return false;

  localVersion.replaceAll(".", "").replace("v", "");
  remoteVersion.replaceAll(".", "").replace("v", "");

  return parseInt(remoteVersion, 10) > parseInt(localVersion, 10);
}
