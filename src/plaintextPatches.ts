import { types } from "replugged";

const patches: types.PlaintextPatch[] = [
  {
    find: ".Messages.SOURCE_MESSAGE_DELETED",
    replacements: [
      {
        // Message Indicator
        match: /var .,.,.=(.)\.className,.=.\.message,.=.\.children,.=.\.content,.=.\.onUpdate/,
        replace:
          "try{$1?.message?.content.match(window.invisiblechat?.INV_DETECTION)?$1?.content.push(window.invisiblechat?.Indicator):null}catch(e){};$&",
      },
    ],
  },
  {
    find: "GIFT_BUTTON).analyticsLocations",
    replacements: [
      {
        // Chatbar Lock
        match: /(.)\.push.{1,}\(.{1,3},\{.{1,30}\},"gift"\)\)/,
        replace: "$&;try{$1.push(window.invisiblechat?.chatbarLock)}catch{}",
      },
    ],
  },
];

export default patches;
