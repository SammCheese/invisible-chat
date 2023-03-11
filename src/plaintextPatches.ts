import { types } from "replugged";

const patches: types.PlaintextPatch[] = [
  {
    replacements: [
      {
        // Chatbar Lock
        match: /(.)\.push.{1,}\(.{1,3},\{.{1,30}\},"gift"\)\)/,
        replace: "$&;try{$1.push(window.invisiblechat?.chatbarLock)}catch{}",
      },
      {
        // Message Indicator
        match: /var .,.,.=(.)\.className,.=.\.message,.=.\.children,.=.\.content,.=.\.onUpdate/,
        replace:
          "try{$1?.content[0].match(window.invisiblechat?.INV_DETECTION)?$1?.content.push(window.invisiblechat?.Indicator):null}catch(e){};$&",
      },
    ],
  },
];

export default patches;
