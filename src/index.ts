import { Indicator } from "./assets/indicator";
import { popoverIcon } from "./assets/popoverIcon";
import { chatbarLock } from "./assets/chatbarLock";
import { initEncModal } from "./components/EncryptionModal";
import { buildDecModal, initDecModal } from "./components/DecryptionModal";

import { cleanupEmbed, getEmbed, updateMessage } from "./utils";

const getStegCloak: Promise<StegCloakImport> = import(
  // @ts-expect-error SHUT UP
  "https://unpkg.com/stegcloak-dist@1.0.1/index.js"
);

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
  // @ts-expect-error adding to window
  window.invisiblechat = {
    popoverIcon,
    INV_DETECTION,
    receiver,
    chatbarLock,
    Indicator,
  };
}

// Grab the data from the above Plantext Patches
function receiver(message: DiscordMessage): void {
  void buildDecModal({ message });
}

export async function buildEmbed(message: DiscordMessage, revealed: string): Promise<void> {
  const urlCheck = revealed.match(URL_DETECTION)!;

  let attachment: DiscordEmbed;
  if (!urlCheck) attachment = await getEmbed(new URL(urlCheck[0]));

  let embed: DiscordEmbed = {
    type: "rich",
    title: "Decrypted Message",
    color: "0x45f5f5",
    description: revealed,
    footer: {
      text: "Made with ❤️ by c0dine and Sammy!",
    },
  };

  message.embeds = message.embeds.map((embed: rawDiscordEmbed) => cleanupEmbed(embed));
  if (attachment!) message.embeds.push(attachment);
  message.embeds.push(embed);
  updateMessage(message);
  return Promise.resolve();
}

export function encrypt(secret: string, password: string, cover: string): string {
  // Appending \u200b to the secret
  // eslint-disable-next-line no-irregular-whitespace
  return steggo.hide(`${secret}​`, password, cover);
}

export function decrypt(secret: string, password: string): string {
  // Removing the \u200b indicator
  // eslint-disable-next-line no-irregular-whitespace
  return steggo.reveal(secret, password).replace("​", "");
}
