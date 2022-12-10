import { webpack, injector } from 'replugged';
import { AnyFunction } from 'replugged/src/types/util';

const inject = new injector.MiniInjector();

export async function start () {
  const typingMod = await webpack.waitForModule(webpack.filters.byProps('startTyping')) as {
    startTyping: AnyFunction
  };
  const getChannelMod = await webpack.waitForModule(webpack.filters.byProps('getChannel')) as {
    getChannel: (id: string) => {
      name: string;
    }
  };

  if (typingMod && getChannelMod) {
    inject.instead(typingMod, 'startTyping', ([ channel ]) => {
      const channelObj = getChannelMod.getChannel(channel as string);
      console.log(`Typing prevented! Channel: #${(channelObj?.name ?? 'unknown')} (${channel}).`);
    });
  }
}

export async function stop () {
  inject.uninjectAll();
}
