import { Injector, OutgoingMessage, settings, webpack } from "replugged";

import StegCloak from "./lib/stegcloak.js";
import { popoverIcon } from "./assets/popoverIcon";

const inject = new Injector();

interface IncomingMessage extends OutgoingMessage {
  embeds: unknown[];
  canPin: undefined | boolean;
}
interface StegCloak {
  hide: (secret: string, password: unknown, cover: string) => string;
  reveal: (secret: string, password: unknown) => string;
}

let activeHotkey = false;
const steggo: StegCloak = new StegCloak(true, false);
const INV_DETECTION = new RegExp(/( \u200c|\u200d |[\u2060-\u2064])[^\u200b]/);

export async function start(): Promise<void> {
  console.log("%c [Invisible Chat] Started!", "color: aquamarine");
  document.addEventListener("keypress", keypress);

  await injectSendMessages();

  // Register the Message Receiver
  // @ts-expect-error We are adding to Window
  window.invisiblechat = {
    popoverIcon,
    INV_DETECTION,
    receiver,
  };
}

function keypress(e: KeyboardEvent): void {
  if (e.ctrlKey && e.key === "j") {
    activeHotkey = !activeHotkey;
    const bar: HTMLElement | null = document.querySelector(
      ".scrollableContainer-15eg7h.webkit-QgSAqd",
    );

    if (!bar) return;

    if (activeHotkey) {
      bar.style.border = "1px solid";
      bar.style.borderColor = "#09FFFF";
    } else {
      bar.style.border = "";
      bar.style.borderColor = "";
    }
  }
}

export function runPlaintextPatches(): void {
  webpack.patchPlaintext([
    {
      replacements: [
        {
          match:
            /.\?(..)\(\{key:"reply",label:.{1,40},icon:.{1,40},channel:(.{1,3}),message:(.{1,3}),onClick:.{1,5}\}\):null/gm,
          replace: `$&,$3.content.match(window.invisiblechat.INV_DETECTION)?$1({key:"decrypt",label:"Decrypt Message",icon:window.invisiblechat.popoverIcon,channel:$2,message:$3,onClick:()=>window.invisiblechat.receiver($3)}):null`,
        },
        {
          match: /var .=(.)\.channel,.=.\.message,.=.\.expanded,.=.\.canCopy/gm,
          replace: `window.invisiblechat.receiver($1.message);$&`,
        },
      ],
    },
  ]);
}

// Grab the data from the above Plantext Patches
function receiver(message: IncomingMessage, canPin: boolean | undefined): void {
  if (typeof canPin === "undefined") {
    if (message.content.match(INV_DETECTION) && !message.content.includes("🔒")) {
      message.content = `🔒${message.content}🔒`;
    }
  } else {
    void buildEmbed(message);
  }
}

async function buildEmbed(message: IncomingMessage): Promise<void> {
  const password =
    (await settings.get("dev.sammcheese.InvisibleChat").get("defaultPassword")) ?? "password";

  // eslint-disable-next-line no-irregular-whitespace
  const revealed = steggo.reveal(message.content.replace("​", ""), password);

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
  updateMessage(message);
  return Promise.resolve();
}

function updateMessage(message: OutgoingMessage): void {
  webpack.common.fluxDispatcher.dispatch({
    type: "MESSAGE_UPDATE",
    message,
  });
}

function injectSendMessages(): Promise<void> {
  inject.before(webpack.common.messages, "sendMessage", (args: OutgoingMessage[]) => {
    if (activeHotkey) {
      try {
        const { content } = args[1];
        const cover = content.match(/(.{0,2000})\*.{0,2000}\*/)![1];
        const hidden = content.match(/\*.{0,2000}\*/)![0].replaceAll("*", "");
        const pw =
          settings.get("dev.sammcheese.InvisibleChat").get("defaultPassword") ?? "password";

        args[1].content = steggo.hide(hidden, pw, cover);
      } catch {
        // DO NOT SEND THE UNENCRYPTED MESSAGE UNDER ANY CIRCUMSTANCE
        args[1].content = "";
      }
    }
    return args;
  });
  return Promise.resolve();
}

export function stop(): void {
  inject.uninjectAll();
  document.removeEventListener("keypress", keypress);
}
