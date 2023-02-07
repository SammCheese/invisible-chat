import { Indicator } from "./assets/indicator";
import { popoverIcon } from "./assets/popoverIcon";
import { chatbarLock } from "./assets/chatbarLock";
import { buildDecModal } from "./components/DecryptionModal";
import { cleanupEmbed, getEmbed, iteratePasswords, stegInit, updateMessage } from "./utils";

const INV_DETECTION = new RegExp(/( \u200c|\u200d |[\u2060-\u2064])[^\u200b]/);
const URL_DETECTION = new RegExp(
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/,
);

export async function start(): Promise<void> {
  // Prepare Lib and Settings
  await stegInit();

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

export { Settings } from "./components/Settings";

// Grab the data from the above Plaintext Patches
async function receiver(message: DiscordMessage): Promise<void> {
  // if a stored password leads to the decrypted string, skip the modal
  await iteratePasswords(message).then((res: string | false) => {
    if (res) return void buildEmbed(message, res);
    return void buildDecModal({ message });
  });
}

export async function buildEmbed(message: DiscordMessage, revealed: string): Promise<void> {
  const urlCheck = revealed.match(URL_DETECTION);

  let embed: DiscordEmbed = {
    type: "rich",
    title: "Decrypted Message",
    color: "0x45f5f5",
    description: revealed,
    footer: {
      text: "Made with ❤️ by c0dine and Sammy!",
    },
  };

  // Convert discords existing embeds to sendable ones. Prevents existing embeds from breaking
  message.embeds = message.embeds.map((embed: rawDiscordEmbed) => cleanupEmbed(embed));
  message.embeds.push(embed);
  if (urlCheck?.length) message.embeds.push(await getEmbed(new URL(urlCheck[0])));

  updateMessage(message);
  return Promise.resolve();
}
