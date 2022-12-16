import { Injector, OutgoingMessage, settings, webpack } from "replugged";
import StegCloak from "./lib/stegcloak.js";

const inject = new Injector();

interface StegCloak {
  hide: (secret: string, password: unknown, cover: string) => string;
  reveal: (secret: string, password: unknown) => string;
}

const steggo: StegCloak = new StegCloak(true, false);

const _INV_DETECTION = new RegExp(/( \u200c|\u200d |[\u2060-\u2064])[^\u200b]/);

let activeHotkey = false;

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

export async function start(): Promise<void> {
  console.log("%c [Invisible Chat] Started!", "color: aquamarine");
  document.addEventListener("keypress", keypress);

  //settings.get('dev.sammcheese.InvisibleChat')

  await injectSendMessages();
  await injectReceivingMessages();
}

async function injectReceivingMessages(): Promise<void> {
  inject.after(webpack.common.messages, "receiveMessage", (args, res) => {
    console.log(args, res);
  });
  return Promise.resolve();
}

async function injectSendMessages(): Promise<void> {
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
