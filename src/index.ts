import { Injector, webpack } from "replugged";

const inject = new Injector();

export async function start(): Promise<void> {
  const typingMod = await webpack.waitForModule<{
    startTyping: (channelId: string) => void;
  }>(webpack.filters.byProps("startTyping"));
  const getChannelMod = await webpack.waitForModule<{
    getChannel: (id: string) => {
      name: string;
    };
  }>(webpack.filters.byProps("getChannel"));

  if (typingMod && getChannelMod) {
    inject.instead(typingMod, "startTyping", ([channel]) => {
      const channelObj = getChannelMod.getChannel(channel);
      console.log(`Typing prevented! Channel: #${channelObj?.name ?? "unknown"} (${channel}).`);
    });
  }
}

export function stop(): void {
  inject.uninjectAll();
}
