import { Injector, OutgoingMessage, webpack } from "replugged";

import { popoverIcon } from "./assets/popoverIcon";
import { chatbarLock } from "./assets/chatbarLock";
import { Indicator } from "./assets/indicator";

import { buildDecModal } from "./components/DecryptionModal";
import StegCloak from "./lib/stegcloak.js";

const inject = new Injector();
const steggo: StegCloak = new StegCloak(true, false);

interface StegCloak {
  hide: (secret: string, password: unknown, cover: string) => string;
  reveal: (secret: string, password: unknown) => string;
}
interface IncomingMessage extends OutgoingMessage {
  embeds: unknown[];
  canPin: undefined | boolean;
}

const EMBED_URL = "https://embed.sammcheese.net";
const INV_DETECTION = new RegExp(/( \u200c|\u200d |[\u2060-\u2064])[^\u200b]/);
const URL_DETECTION = new RegExp(
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/,
);

// eslint-disable-next-line @typescript-eslint/require-await
export async function start(): Promise<void> {
  console.log("%c [Invisible Chat] Started!", "color: aquamarine");

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

export function runPlaintextPatches(): void {
  webpack.patchPlaintext([
    {
      replacements: [
        {
          // Minipopover Lock
          match:
            /.\?(..)\(\{key:"reply",label:.{1,40},icon:.{1,40},channel:(.{1,3}),message:(.{1,3}),onClick:.{1,5}\}\):null/gm,
          replace: `$&,$3.content.match(window.invisiblechat.INV_DETECTION)?$1({key:"decrypt",label:"Decrypt Message",icon:window.invisiblechat.popoverIcon,channel:$2,message:$3,onClick:()=>window.invisiblechat.receiver($3)}):null`,
        },
        {
          // Chatbar Lock
          match: /.=.\.activeCommand,.=.\.activeCommandOption,(.)=\[\];/,
          replace: "$&;$1.push(window.invisiblechat.chatbarLock);",
        },
        {
          // Message Indicator
          match: /var .,.,.=(.)\.className,.=.\.message,.=.\.children,.=.\.content,.=.\.onUpdate/,
          replace:
            "try{$1?.content[0].match(window.invisiblechat.INV_DETECTION)?$1?.content.push(window.invisiblechat.Indicator):null}catch(e){};$&",
        },
      ],
    },
  ]);
}

// Grab the data from the above Plantext Patches
function receiver(message: IncomingMessage): void {
  buildDecModal(message);
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

export async function buildEmbed(message: IncomingMessage, revealed: string): Promise<void> {
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

  message.embeds.push(embed);
  if (attachment) message.embeds.push(attachment);
  updateMessage(message);
  return Promise.resolve();
}

function updateMessage(message: OutgoingMessage): void {
  webpack.common.fluxDispatcher.dispatch({
    type: "MESSAGE_UPDATE",
    message,
  });
}

export function stop(): void {
  inject.uninjectAll();
}

export function encrypt(secret: string, password: string, cover: string): string {
  return steggo.hide(secret, password, cover);
}

export function decrypt(secret: string, password: string): string {
  // Remove the Indicator when revealing
  // eslint-disable-next-line no-irregular-whitespace
  return steggo.reveal(secret, password).replace("​", "");
}
