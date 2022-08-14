const { join } = require("path");
const { existsSync } = require("fs");
const { execSync } = require("child_process");
const nodeModulesPath = join(__dirname, "node_modules");

function installDeps() {
  console.log("Installing dependencies, please wait...");
  execSync("npm install --only=prod", {
    cwd: __dirname,
    stdio: [null, null, null]
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

// Kernel Users, run npm i in the folder and remove the code above this line to make everything work
// Plugin Start

const { Plugin } = require('powercord/entities');
const { open: openModal } = require('powercord/modal');
const { inject, uninject } = require('powercord/injector');
const { getModule, React, messages } = require('powercord/webpack');
const { findInReactTree } = require('powercord/util');

const Steggo = require('stegcloak');
const Settings = require("./Settings/Settings");
const Button = require('./assets/Icons/Button');
const f = require('./components/Functions');
const LockIcon = require('./assets/Icons/LockIcon');
const { Lock } = require('./assets/Icons/MessageIcon');
const CloseButton = require("./assets/Icons/CloseButton");

const { ModalComposerEncrypt, ModalComposerDecrypt } = require('./components/ModalComposer');

const INV_DETECTION = new RegExp(/( \u200c|\u200d |[\u2060-\u2064])[^\u200b]/);

const MiniPopover = getModule(
  (m) => m.default?.displayName === "MiniPopover",
  false
);

const ChannelTextAreaButtons = getModule(
  (m) => m.type && m.type.displayName === 'ChannelTextAreaButtons',
  false
);

const { MenuItem } = getModule(['MenuItem'], false);

module.exports = class InvisbleChatRewrite extends Plugin {
  async startPlugin() {
    powercord.api.settings.registerSettings("invichat", {
      label: "Invisible Chat",
      category: this.entityID,
      render: Settings,
    });
    this.__injectSendingMessages();
    this.__injectIndicator();
    this.__injectDecryptButton();

    this.settings.get("useInvisibleAttachmentButton", false) ?
      this.__injectAttachmentButton() :
      this.__injectChatBarIcon();
  }
  

  async __handleSettingsChange(setting, value) {
    switch (setting) {
      case "useInvisibleAttachmentButton":
        if (value) {
          this.__injectAttachmentButton();
          uninject('invisible-chatbutton');
        } else {
          this.__injectChatBarIcon();
          uninject('invisible-attachbutton');
        }
        break;
    }
  }

  async __injectAttachmentButton() {
    const ChannelAttachMenu = await getModule(
      m => m.default?.displayName === "ChannelAttachMenu",
    );

    // No point in trying to inject if the module is not found
    if (!ChannelAttachMenu) return;

    inject('invisible-attachbutton',  ChannelAttachMenu, 'default', (args, res) => {

      res.props.children.push(
        React.createElement(MenuItem, {
          label: React.createElement(
            'div',
            {
              className: 'optionLabel-1o-h-l',
            },
            null,
            React.createElement('div', {
              className: 'fas fa-lock optionIcon-1Ft8w0 ',
              style: {
                fontSize: '18px',
                textAlign: 'center',
                verticalAlign: 'middle',
                width: '24px',
                height: '24px',
                lineHeight: '24px',
              },
            }),
            React.createElement(
              'div',
              {
                className: 'optionName-1ebPjH',
              },
              null,
              'Encrypt Message',
            ),
          ),
          id: "invisible-attachbutton",
          showIconFirst: true,
          action: () => openModal(ModalComposerEncrypt)
        })
      )
      return res;
    })
  }

  async __injectChatBarIcon() {
    // Error handling for if the module is not found
    if (ChannelTextAreaButtons.type === undefined) return;

    inject('invisible-chatbutton', ChannelTextAreaButtons, 'type', (args, res) => {

      // Create the Button Element
      const button = React.createElement('div', {
          className: 'send-invisible-message',
          onClick: () => {
            openModal(ModalComposerEncrypt);
          }
        }, React.createElement(Button)
      );

      try {
        // Add the Button to the Chatbar
        res.props.children.unshift(button);
      } catch {}
      return res;
      }
    )
    ChannelTextAreaButtons.type.displayName = "ChannelTextAreaButtons";
  }

  async __injectDecryptButton() {

    // Error handling for if the module is not found
    if (!MiniPopover) return;

    inject('invichat-minipopover', MiniPopover, 'default', (_, res) => {
      const msg = findInReactTree(res, (n) => n && n.message)?.message;

      if (!msg) return res;

      // Is this message an encrypted message?
      const match = 
        msg.content.match(INV_DETECTION) ??
        msg.embeds.find(e => INV_DETECTION.test(e.rawDescription))?.rawDescription?.match(INV_DETECTION);

      // If not, STOP.
      if (!match) return res;

      // Add the decrypt button to the Toolbar
      res.props.children.unshift(
        React.createElement('div', {
          onClick: () => {
            // Try every password saved and decrypt, else open Password Prompt
            f.iteratePasswords(this.settings.get("userPasswords", []), ModalComposerDecrypt, {
              author: msg.author.id,
              content: match.input,
              channel: msg.channel_id,
              message: msg.id
            })
          }
        },
        [React.createElement(LockIcon)])
      )
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

    // Error handling for if the module is not found
    if (!MessageContent) return;
      
    inject('invisible-messageContent', MessageContent, 'default', (_, res) => {
        const msg = findInReactTree(res, (n) => n && n.message)?.message;

        if (!msg) return res;

        // Is this message an encrypted message?
        const match =
          msg.content.match(INV_DETECTION) ??
          msg.embeds.find(e => INV_DETECTION.test(e.rawDescription))?.rawDescription?.match(INV_DETECTION);

        // If not, STOP.
        if (!match) return res;

        res.props.children.props.children[3].props.children.push(
          React.createElement(Lock)
        );

        // Look through the footers for our default footer, add a Discard Button if we find it
        if (msg.embeds.find(e => e.footer && e.footer.text.includes("c0dine and Sammy"))) {
          res.props.children.props.children[3].props.children.push(
            React.createElement('span', {}, React.createElement(CloseButton, {
              message: msg
            }))
          )
        }

        return res;
      }
    );
  }

  async __injectSendingMessages() {
    inject('invisible-catchMessage', messages, 'sendMessage', (args, res) => {
      const content = args[1].content;
      const matchHidden = content.match(/\#\!.{0,2000}\!\#/);
      const matchPwd = content.match(/\#\?.{0,2000}\?\#/);
      if (matchHidden && matchPwd) {
        const coverMessage = content.match(/(.{0,2000} .{0,2000}) \#\!/)[1];
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
    return steggo.hide(inviMessage + '​', password, coverMessage); // \u200b for detection of invisible messages, Apate and ALiucord Plugins use this
  }

  pluginWillUnload() {
    uninject('invisible-chatbutton');
    uninject('invisible-catchMessage');
    uninject('invisible-messageContent');
    uninject('invichat-minipopover');
    uninject('invisible-attachbutton');
    powercord.api.settings.unregisterSettings("invichat");
  }
}
