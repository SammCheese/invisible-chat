const isImageUrl = require('is-image-url')
const { getModule, channels } = require("powercord/webpack")

const { createBotMessage } = getModule([ "createBotMessage" ], false)
const { receiveMessage }   = getModule([ "receiveMessage" ], false)

// Image width + Height
exports.imageWH = async (url) => {
  let res;
  if (isImageUrl(url)) {
    await new Promise((resolve) => {
      let img = new Image();
      img.src = url;
      img.onload = function () {
        res = { width: this.width, height: this.height };
        resolve();
      }
    });
    return res;
  }
  return false;
};

// I'll Put this Here to make Index.js it more clean

/******************BASE EMBED******************/
////////////////////////////////////////////////
let embed = {
  type: "rich",
  color: "0x45f5f5",
  footer: {
    text: "Made with ❤️ by c0dine and Sammy!",
  },
};
////////////////////////////////////////////////


// Send Botmessage to current Channel
exports.sendBotMessage = (content) => {
  const received = createBotMessage(channels.getChannelId(), "");
  received.embeds.push(content);
  return receiveMessage(received.channel_id, received);
}

// If Base Embed Should be Used
exports.reply = (title, content, footer) => {
  this.sendBotMessage(
    Object.assign(
      {
        title: title,
        description: content,
        footer: {
          text: "Made with ❤️ by c0dine and Sammy!",
        },
      },
      embed
    )
  );
}

// Handle Errors
exports.replyError = (content) => {
  this.sendBotMessage(
    Object.assign(embed, {
      title: "There has Been an Error",
      description: content,
    })
  );
}

// Map User Passwords
exports.getUserPasswordById = (id) => {
  const userPws = powercord.pluginManager.get("invisible-chat").settings.get("userPasswords");
  try {
    for (var i = 0; i < userPws.length; i++) {
      if (userPws[i].id == id) {
        return userPws[i].password;
      }
    }
  } catch (err) {}
  return "PASSWORD_HERE";
}
