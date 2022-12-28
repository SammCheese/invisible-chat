import { common } from "replugged";

import { Indicator } from "./assets/indicator";
import { popoverIcon } from "./assets/popoverIcon";
import { chatbarLock } from "./assets/chatbarLock";
import { initEncModal } from "./components/EncryptionModal";
import { buildDecModal, initDecModal } from "./components/DecryptionModal";

const getStegCloak: Promise<StegCloakImport> = import(
  // @ts-expect-error SHUT UP
  "https://unpkg.com/stegcloak-dist@1.0.0/index.js"
);

// TYPES

type Constructor<StegCloak> = new (encrypt: boolean, useHmac: boolean) => Promise<StegCloak>;

interface StegCloak {
  hide: (secret: string, password: string, cover: string) => string;
  reveal: (secret: string, password: string) => string;
}

interface StegCloakImport {
  default: Constructor<StegCloak>;
}

interface DiscordEmbed {
  title: string;
  type: string;
  description: string;
  url?: string;
  timestamp?: EpochTimeStamp;
  color?: number;
  footer?: object;
  image?: object;
  thumbnail?: object;
  video?: object;
  provider?: object;
  author?: object;
}

// CONSTANTS

const EMBED_URL = "https://embed.sammcheese.net";
const INV_DETECTION = new RegExp(/( \u200c|\u200d |[\u2060-\u2064])[^\u200b]/);
const URL_DETECTION = new RegExp(
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/,
);

let StegCloak: Constructor<StegCloak>;
let steggo: StegCloak;

export async function start(): Promise<void> {
  // Prepare Lib
  StegCloak = (await getStegCloak).default;
  steggo = await new StegCloak(true, false);

  // Prepare Modals
  await initDecModal();
  await initEncModal();

  // Register the Message Receiver
  // @ts-expect-error We are adding to Window
  window.invisiblechat = {
    popoverIcon,
    INV_DETECTION,
    receiver,
    chatbarLock,
    Indicator,
  };
}

// Grab the data from the above Plantext Patches
function receiver(message: unknown): void {
  void buildDecModal({ message });
}

// Gets the Embed of a Link
async function getEmbed(url: URL): Promise<DiscordEmbed> {
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

export function removeEmbed(message: unknown): void {
  // @ts-expect-error not typed
  for (let embed in message.embeds) {
    // @ts-expect-error not typed
    if (message.embeds[embed]?.footer?.text.includes("c0dine and Sammy!")) {
      // @ts-expect-error not typed
      message.embeds.splice(embed, 1);
    }
  }
  updateMessage(message);
}

export async function buildEmbed(message: unknown, revealed: string): Promise<void> {
  const urlCheck = revealed.match(URL_DETECTION) || [];

  let attachment: DiscordEmbed;
  if (urlCheck[0]) attachment = await getEmbed(new URL(urlCheck[0]));

  let embed = {
    type: "rich",
    title: "Decrypted Message",
    color: "0x45f5f5",
    description: revealed,
    footer: {
      text: "Made with ❤️ by c0dine and Sammy!",
    },
  };

  // @ts-expect-error no type
  message.embeds.push(embed);
  // @ts-expect-error no type
  if (attachment) message.embeds.push(attachment);
  updateMessage(message);
  return Promise.resolve();
}

function updateMessage(message: unknown): void {
  // @ts-expect-error no type
  common.fluxDispatcher.dispatch({
    type: "MESSAGE_UPDATE",
    message,
  });
}

export function stop(): void {}

export function encrypt(secret: string, password: string, cover: string): string {
  // Add Identifier unicode to secret (\u200b)
  // eslint-disable-next-line no-irregular-whitespace
  return steggo.hide(`${secret}​`, password, cover);
}

export function decrypt(secret: string, password: string): string {
  // Remove the Indicator when revealing
  // eslint-disable-next-line no-irregular-whitespace
  return steggo.reveal(secret, password).replace("​", "");
}
