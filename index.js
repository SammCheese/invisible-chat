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

const { Plugin } = require('powercord/entities');
const { open: openModal } = require('powercord/modal');
const { inject, uninject } = require('powercord/injector');
const { getModule, React, messages } = require('powercord/webpack');
const { findInReactTree } = require('powercord/util');

const Steggo   = require('stegcloak');
const Settings = require("./Settings/Settings");
const Button   = require('./assets/Icons/Button');
const f        = require('./components/Functions');
const LockIcon = require('./assets/Icons/LockIcon');
const { Lock } = require('./assets/Icons/MessageIcon');
const CloseButton = require("./assets/Icons/CloseButton");

const { ModalComposerEncrypt, ModalComposerDecrypt } = require('./components/ModalComposer');

const { ComponentDispatch } = getModule(["ComponentDispatch"], false);

let MiniPopover = getModule(
  (m) => m.default?.displayName === "MiniPopover",
  false
);

let ChannelTextAreaButtons = getModule(
  (m) => m.type && m.type.displayName === 'ChannelTextAreaButtons',
  false
);

module.exports = class InvisbleChatRewrite extends Plugin {
  async startPlugin() {
    this.__injectChatBarIcon();
    this.__injectSendingMessages();
    this.__injectIndicator();
    this.__injectDecryptButton();

    powercord.api.settings.registerSettings("invichat", {
      label: "Invisible Chat",
      category: this.entityID,
      render: Settings,
    });
  }

  async __injectChatBarIcon() {
    inject(
      'invisible-chatbutton',
      ChannelTextAreaButtons,
      'type',
      (args, res) => {
        const button = React.createElement('div', {
          className: 'send-invisible-message',
          onClick: () => {
            openModal(ModalComposerEncrypt);
          }
        }, React.createElement(Button))
        try {
          res.props.children.unshift(button);
        } catch {}
        return res;
      }
    )
    ChannelTextAreaButtons.type.displayName =
    "ChannelTextAreaButtons";
  }

  async __injectDecryptButton() {
    inject('invichat-minipopover', MiniPopover, 'default', (_, res) => {
      const msg = findInReactTree(res, (n) => n && n.message)?.message;
      if (!msg) return res;
      if (msg.content.match(/( \u200c|\u200d |[\u2060-\u2064])[^\u200b]/)) {
        res.props.children.unshift(
          React.createElement('div', {
            onClick: () => {
              f.iteratePasswords(this.settings.get("userPasswords", []), ModalComposerDecrypt, {
                author: msg.author.id,
                content: msg.content,
                channel: msg.channel_id,
                message: msg.id
              })
            }
          },
          [React.createElement(LockIcon)])
        )
      }
      return res;
    })
    MiniPopover.default.displayName = 'MiniPopover';
  }

  async __injectIndicator() {
    const d = (m) => {
      const def = m.__powercordOriginal_default ?? m.default;
      return typeof def == 'function' ? def : null;
    };
    const MessageContent = await getModule((m) => {
      return d(m)?.toString().includes('MessageContent');
    });

    if (MessageContent) {
      inject(
        'invisible-messageContent',
        MessageContent,
        'default',
        ([props], res) => {
          const v = findInReactTree(res, (n) => n && n.message)?.message; // \u200b is used by another Aliucord plugin causing false positives, so we exclude it
            if (v && v.content && v.content.match(/( \u200c|\u200d |[\u2060-\u2064])[^\u200b]/)) {
              res.props.children.props.children[2].props.children.push(
                React.createElement(Lock)
              );
            }
            if (v && v.embeds.find(e => e.footer && e.footer.text.includes("Made with ❤️ by c0dine and Sammy"))) {
              res.props.children.props.children[2].props.children.push(
                React.createElement('span', {
                }, React.createElement(CloseButton, {
                  message: v
                }))
              )
            }
            return res;
        }
      );
    }
  }

  async __injectSendingMessages() {
    inject('invisible-catchMessage', messages, 'sendMessage', (args, res) => {
      let content = args[1].content;
      let matchHidden = content.match(/\#\!.{0,2000}\!\#/);
      let matchPwd = content.match(/\#\?.{0,2000}\?\#/);
      if (matchHidden && matchPwd) {
        let coverMessage = content.match(/(.{0,2000} .{0,2000}) \#\!/)[1];
        if (coverMessage) {
          matchPwd[0] = matchPwd[0].slice(2, -2)
          matchHidden[0] = matchHidden[0].slice(2, -2)
          args[1].content = this.__handleEncryption(coverMessage, matchHidden[0], matchPwd[0]);
        }
      }
      return args;
    }, true)
  }

  __handleEncryption(coverMessage, inviMessage, password) {
    const steggo = new Steggo(true, false);
    let encrypted = steggo.hide(inviMessage + '​', password, coverMessage); // \u200b for detection of invisible messages, Apate and ALiucord Plugins use this
    return encrypted;                                                       
  }

  pluginWillUnload() {
    uninject('invisible-chatbutton');
    uninject('invisible-catchMessage');
    uninject('invisible-messageContent');
    uninject('invichat-minipopover');
    powercord.api.settings.unregisterSettings("invichat");
  }
}
