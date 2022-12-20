import { types } from "replugged";

const patches: types.PlaintextPatch[] = [
  {
    replacements: [
      {
        // Minipopover Lock
        match:
          /.\?(..)\(\{key:"reply",label:.{1,40},icon:.{1,40},channel:(.{1,3}),message:(.{1,3}),onClick:.{1,5}\}\):null/gm,
        replace: `$&,$3.content.match(window.invisiblechat.INV_DETECTION)?$1({key:"decrypt",label:"Decrypt Message",icon:window.invisiblechat.popoverIcon,channel:$2,message:$3,onClick:()=>window.invisiblechat.receiver($3)}):null`,
      },
      {
        // Chatbar Lock
        match: /.=.\.activeCommand,.=.\.activeCommandOption,.{0,155},(.)=\[\];/,
        replace: "$&;$1.push(window.invisiblechat.chatbarLock);",
      },
      {
        // Message Indicator
        match: /var .,.,.=(.)\.className,.=.\.message,.=.\.children,.=.\.content,.=.\.onUpdate/,
        replace:
          "try{$1?.content[0].match(window.invisiblechat.INV_DETECTION)?$1?.content.push(window.invisiblechat.Indicator):null}catch(e){};$&",
      },
    ],
  },
];

export default patches;
