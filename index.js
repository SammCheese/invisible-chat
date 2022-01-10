const { join } = require("path");
const { existsSync } = require("fs");
const { execSync } = require("child_process");
const nodeModulesPath = join(__dirname,"node_modules");

function installDeps () {
  console.log("Installing dependencies, please wait...");
  execSync("npm install --only=prod", {
    cwd: __dirname,
    stdio: [ null, null, null ]
  });
  console.log("Dependencies successfully installed!");
  setTimeout(() => {
    powercord.pluginManager.remount(__dirname);
  }, 2000);
}

if (!existsSync(nodeModulesPath)) {
  installDeps();
  return;
}

// Plugin Start

const { Plugin } = require("powercord/entities");
const { getModule,React,constants: { Permissions: { SEND_MESSAGES } } } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { open: openModal } = require("powercord/modal");
const { findInReactTree } = require("powercord/util");

const { handler }   = require("./commands/invichat");
const chatembed     = require("./commands/chatembed");
const Functions     = require("./components/Functions");
const Button        = require("./components/icons/Button");
const LockIcon      = require("./components/icons/LockIcon");
const Settings      = require("./components/Settings/Settings");
const { Lock }      = require("./components/icons/MessageIcon");
const ModalComposerEncrypt = require("./components/ModalComposerEncrypt");
const ModalComposerDecrypt = require("./components/ModalComposerDecrypt");

const MiniPopover = getModule(
  (m) => m.default?.displayName === "MiniPopover",
  false
);

/*
* Any boxed out parts of the program are final unless needed to be changed on occurence of a bug
*/
module.exports = class InviChat extends Plugin {
  /*********** Colors ***********/
  ////////////////////////////////
  get hexiColor() {
    return "0x45f5f5";
  }
  get color() {
    return "#45f5f5";
  }
  get errorColor() {
    return "0xf54242";
  }
  get debugColor() {
    return "0xf56942";
  }
  get successColor() {
    return this.color();
  }
  ////////////////////////////////

  /******************** Smart Webpack Module Imports ********************/
  ////////////////////////////////////////////////////////////////////////
  async import(filter, functionName = filter) {
    if (typeof filter === "string") {
      filter = [filter];
    }
    this[functionName] = (await getModule(filter))[functionName];
  }
  async prepareClass() {
    await this.import(["getLastSelectedChannelId"], "getChannelId");
    await this.import("getChannel");
    await this.import("getCurrentUser");
    await this.import(["can", "canEveryone"], "can");
    await this.import("getChannelPermissions");
  }
  ////////////////////////////////////////////////////////////////////////

  register() {
    // Register main command
    powercord.api.commands.registerCommand({
      command: "invichat",
      description: "Send an invisible message",
      usage:
        "{c} < -m [hidden message] -c [camo message] -p [password] || -s [encryted message] -p [password]>",
      executor: (args) => {
        const Data = handler(args, this);
        const UrlRegex = new RegExp(
          /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/,
          "ig"
        );
        const MatchedUrl = Data.match(UrlRegex);

        if (!args.includes("-c")) {
          if (MatchedUrl) {
            return chatembed.executor(Data, MatchedUrl.toString()+"?"+(new Date().getTime()))
          }
          return Functions.reply("Your Decrypted Message", Data);
        }
        return Functions.reply("Your Encrypted Message", Data);
      },
    });
    // Settings
    powercord.api.settings.registerSettings("invichat", {
      label: "Invisible Chat",
      category: this.entityID,
      render: Settings,
    });
  }

  injectIcon() {
    const ChannelTextAreaContainer = getModule(
      (m) =>
        m.type &&
        m.type.render &&
        m.type.render.displayName === "ChannelTextAreaContainer",
      false
    );

    inject(
      "invichat-button",
      ChannelTextAreaContainer.type,
      "render",
      (args, res) => {
        const props = findInReactTree(
          res,
          (r) => r && r.className && r.className.indexOf("buttons-") == 0
        );
        const el = React.createElement(
          "div",
          {
            className: ".send-invisible-message",
            onClick: () => openModal(ModalComposerEncrypt)
          },
          React.createElement(Button)
        );
        props.children.unshift(el);
        return res;
      }
    );
    ChannelTextAreaContainer.type.render.displayName =
      "ChannelTextAreaContainer";
  }

  async injectIconMessages() {
    const d = (m) => {
      const def = m.__powercordOriginal_default ?? m.default;
      return typeof def === "function" ? def : null;
    };
    const MessageHeader = await getModule((m) =>
      d(m)?.toString().includes("MessageContent")
    );

    if (MessageHeader) {
      inject(
        "invichat-message-indicator",
        MessageHeader,
        "default",
        function ([props], res) {
          var v = findInReactTree(res, (r) => r && r.message)?.message.content;
          try {
            if (
              v.match(/(\u200c|\u200d|[\u2060-\u2064])\w{1}/)
            ) {
              res.props.children.props.children[2].props.children.push(
                React.createElement(Lock)
              );
              return res;
            }
          } catch {
            return res;
          }
          return res;
        }
      );
    }
  }

  injectToolbar() {
    inject("invichat-indicator", MiniPopover, "default", (_, res) => {
      const msg = findInReactTree(res, (r) => r && r.message)?.message;
      if (!msg) return res;

      if (msg.content.match(/(\u200c|\u200d|[\u2060-\u2064])\w{1}/)) {
        res.props.children.unshift(
          React.createElement("div",
          {
            onClick: async () => openModal(() => React.createElement(ModalComposerDecrypt, {
              author: msg.author.id,
              content: msg.content
            }))
          }, 
          [React.createElement(LockIcon)])
        )
      }
      return res;
    });
    MiniPopover.default.displayName = "MiniPopover";
  }

  async startPlugin() {
    await this.prepareClass()
    this.register();
    this.injectIcon();
    this.injectToolbar();
    this.injectIconMessages();
  }

  async pluginWillUnload() {
    uninject("invichat-button");
    uninject("invichat-indicator");
    uninject("invichat-message-indicator");
    powercord.api.commands.unregisterCommand("invichat");
    powercord.api.settings.unregisterSettings("invichat");
  }
};
