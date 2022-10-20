export async function start () {
  // @ts-expect-error Not a global yet
  // eslint-disable-next-line no-undef
  const { webpack, injector } = replugged as Window['replugged'];

  const typingMod = await webpack.waitFor(webpack.byPropsFilter([ 'startTyping' ]));
  const getChannelMod = await webpack.waitFor(webpack.byPropsFilter([ 'getChannel' ])) as {
    getChannel: (id: string) => {
      name: string;
    }
  };

  if (typingMod && getChannelMod) {
    injector.instead(typingMod, 'startTyping', ([ channel ]) => {
      const channelObj = getChannelMod.getChannel(channel as string);
      console.log(`Typing prevented! Channel: #${(channelObj?.name ?? 'unknown')} (${channel}).`);
    });
  }
}
