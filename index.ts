import type { PluginContext } from "replugged/src/types/entities";
import type _ from "replugged/src/globals";

export async function start(ctx: PluginContext<Record<string, unknown>>) {
  window.replugged.webpack.patchPlaintext([
    {
      find: "startTyping",
      replacements: [
        {
          match: /startTyping:.+?,stop/,
          replace: "startTyping:()=>{},stop",
        },
      ],
    },
  ]);
}

export async function stop() {}
