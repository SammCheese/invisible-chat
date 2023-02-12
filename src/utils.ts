/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/naming-convention */

import { common, settings } from "replugged";

const EMBED_URL = "https://embed.sammcheese.net";

const getStegCloak: Promise<StegCloakImport> = import(
  // @ts-expect-error SHUT UP
  "https://unpkg.com/stegcloak-dist@1.0.0/index.js"
);

let StegCloak: Constructor<StegCloak>;
let steggo: StegCloak;

export let InvSettings: settings.SettingsManager<
  { passwords: string[]; defaultPassword: string },
  never
>;

// Load
export async function stegInit(): Promise<void> {
  StegCloak = (await getStegCloak).default;
  steggo = await new StegCloak(true, false);

  InvSettings = await settings.init("invisiblechat", {
    passwords: [],
    defaultPassword: "password",
  });
}

export function cleanupEmbed(embed: rawDiscordEmbed): DiscordEmbed {
  /* backported code from MLV2 rewrite */
  // @ts-expect-error Already Cleaned
  if (!embed.id) return embed;
  // @ts-expect-error Empty Array
  const retEmbed: DiscordEmbed = {};
  if (typeof embed.rawTitle === "string") retEmbed.title = embed.rawTitle;
  if (typeof embed.rawDescription === "string") retEmbed.description = embed.rawDescription;
  if (typeof embed.referenceId !== "undefined") retEmbed.reference_id = embed.referenceId;
  if (typeof embed.color === "string") retEmbed.color = embed.color;
  if (typeof embed.type !== "undefined") retEmbed.type = embed.type;
  if (typeof embed.url !== "undefined") retEmbed.url = embed.url;
  if (typeof embed.provider === "object")
    retEmbed.provider = { name: embed.provider.name, url: embed.provider.url };
  if (typeof embed.footer === "object")
    retEmbed.footer = {
      text: embed.footer.text,
      icon_url: embed.footer.iconURL,
      proxy_icon_url: embed.footer.iconProxyURL,
    };
  if (typeof embed.author === "object")
    retEmbed.author = {
      name: embed.author.name,
      url: embed.author.url,
      icon_url: embed.author.iconURL,
      proxy_icon_url: embed.author.iconProxyURL,
    };
  if (typeof embed.timestamp === "object" && embed.timestamp._isAMomentObject)
    retEmbed.timestamp = embed.timestamp.milliseconds();
  if (typeof embed.thumbnail === "object") {
    if (
      typeof embed.thumbnail.proxyURL === "string" ||
      (typeof embed.thumbnail.url === "string" && !embed.thumbnail.url.endsWith("?format=jpeg"))
    ) {
      retEmbed.thumbnail = {
        url: embed.thumbnail.url,
        proxy_url:
          typeof embed.thumbnail.proxyURL === "string"
            ? embed.thumbnail.proxyURL.split("?format")[0]
            : undefined,
        width: embed.thumbnail.width,
        height: embed.thumbnail.height,
      };
    }
  }
  if (typeof embed.image === "object") {
    retEmbed.image = {
      url: embed.image.url,
      proxy_url: embed.image.proxyURL,
      width: embed.image.width,
      height: embed.image.height,
    };
  }
  if (typeof embed.video === "object") {
    retEmbed.video = {
      url: embed.video.url,
      proxy_url: embed.video.proxyURL,
      width: embed.video.width,
      height: embed.video.height,
    };
  }
  if (Array.isArray(embed.fields) && embed.fields.length) {
    // @ts-expect-error ???
    retEmbed.fields = embed.fields.map((e) => ({
      name: e.rawName,
      value: e.rawValue,
      inline: e.inline,
    }));
  }
  return retEmbed;
}

export function updateMessage(message: unknown): void {
  common.fluxDispatcher.dispatch({
    type: "MESSAGE_UPDATE",
    message,
  });
}

export function removeEmbed(message: DiscordMessage): void {
  for (let embed in message.embeds) {
    if (message.embeds[embed]?.footer?.text.includes("c0dine and Sammy!")) {
      message.embeds.splice(embed, 1);
    }
  }
  updateMessage(message);
}

export async function getEmbed(url: URL): Promise<DiscordEmbed> {
  // Timeout after 5 seconds
  const controller = new AbortController();
  const _timeout = setTimeout(() => controller.abort(), 5000);

  const options = {
    signal: controller.signal,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
    }),
  };

  const rawRes = await fetch(EMBED_URL, options);
  return await rawRes.json();
}

// Check for the extra character we add during encryption
export function isCorrectPassword(result: string): boolean {
  return result.endsWith("\u200b");
}

// Iterates through passwords and returns either false or the decrypted message
// eslint-disable-next-line @typescript-eslint/require-await
export async function iteratePasswords(message: DiscordMessage): Promise<string | false> {
  const passwords = InvSettings.get("passwords", []);
  if (!message?.content || !passwords?.length) return false;

  let { content } = message;

  // we use an extra variable so we dont have to edit the message content directly
  if (/^\W/.test(message.content)) content = `d ${message.content}d`;

  for (let i = 0; i < passwords.length; i++) {
    const result = decrypt(content, passwords[i], false);
    if (isCorrectPassword(result)) {
      return result;
    }
  }

  return false;
}

export function encrypt(secret: string, password: string, cover: string): string {
  // Appending \u200b to the secret for password recognition
  return steggo.hide(`${secret}\u200b`, password, cover);
}

export function decrypt(secret: string, password: string, removedetection: boolean): string {
  const decrypted = steggo.reveal(secret, password);
  return removedetection ? decrypted.replace("\u200b", "") : decrypted;
}
