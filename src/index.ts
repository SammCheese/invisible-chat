import { Injector, webpack } from "replugged";
import { AnyFunction } from "replugged/dist/types/util";

const inject = new Injector();

export async function start(): Promise<void> {
  const typingMod = (await webpack.waitForModule(webpack.filters.byProps("startTyping"))) as {
    startTyping: AnyFunction;
  };
  const getChannelMod = (await webpack.waitForModule(webpack.filters.byProps("getChannel"))) as {
    getChannel: (id: string) => {
      name: string;
    };
  };

  if (typingMod && getChannelMod) {
    inject.instead(typingMod, "startTyping", ([channel]) => {
      const channelObj = getChannelMod.getChannel(channel as string);
      console.log(`Typing prevented! Channel: #${channelObj?.name ?? "unknown"} (${channel}).`);
    });
  }
}

export function stop(): void {
  inject.uninjectAll();
}
