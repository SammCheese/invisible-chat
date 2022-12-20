import { Injector, common } from "replugged";

import { popoverIcon } from "./assets/popoverIcon";
import { chatbarLock } from "./assets/chatbarLock";
import { Indicator } from "./assets/indicator";

import { buildDecModal, initDecModal } from "./components/DecryptionModal";
import { initModals } from "./components/Modals";

import StegCloak from "./lib/stegcloak.js";
import { initEncModal } from "./components/EncryptionModal";

const inject = new Injector();
const steggo: StegCloak = new StegCloak(true, false);

interface StegCloak {
  hide: (secret: string, password: unknown, cover: string) => string;
  reveal: (secret: string, password: unknown) => string;
}

const EMBED_URL = "https://embed.sammcheese.net";
const INV_DETECTION = new RegExp(/( \u200c|\u200d |[\u2060-\u2064])[^\u200b]/);
const URL_DETECTION = new RegExp(
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/,
);

export async function start(): Promise<void> {
  // Prepare Modals
  await initModals();
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

  console.log("%c [Invisible Chat] Started!", "color: aquamarine");
}

// Grab the data from the above Plantext Patches
function receiver(message: unknown): void {
  void buildDecModal({ message });
}

// Gets the Embed of a Link
async function getEmbed(url: URL): Promise<JSON> {
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

export async function buildEmbed(message: unknown, revealed: string): Promise<void> {
  const urlCheck = revealed.match(URL_DETECTION) || [];

  let attachment;
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

export function stop(): void {
  inject.uninjectAll();
}

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
