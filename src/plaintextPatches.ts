import { types } from "replugged";

const patches: types.PlaintextPatch[] = [
  {
    replacements: [
      {
        // Minipopover Lock
        match:
          /.\?(..)\(\{key:"reply-other",channel:(.{1,5}),message:(.{1,5}),label:.{1,50},icon:.{1,5},onClick:.{1,6}\}\):null/gm,
        replace: `$&,$3.content.match(window.invisiblechat?.INV_DETECTION)?$1({key:"decrypt",label:"Decrypt Message",icon:window.invisiblechat.popoverIcon,channel:$2,message:$3,onClick:()=>window.invisiblechat.receiver($3)}):null`,
      },
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
