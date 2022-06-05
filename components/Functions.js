const { open: openModal } = require('powercord/modal');
const { getModule, FluxDispatcher, React } = require('powercord/webpack');
const StegCloak = require('stegcloak');


const { getMessage } = getModule(['getMessages'], false)

exports.doEmbed = async (messageId, ChannelId, content, url) => {
  const message = getMessage(ChannelId, messageId);
  let wh;
  let image = {};

  if (url && this.isImage(url)) wh = await this.getImageResolutionByUrl(this.isImage(url));
  content = content.replace('​', '');
  url && this.isImage(url) ? image = { url: this.isImage(url), width: wh.width, height: wh.height } : image = {}

  let embed = {
    type: "rich",
    title: "Decrypted Message",
    color: "0x45f5f5",
    description: content,
    image: image,
    footer: {
      text: "Made with ❤️ by c0dine and Sammy!",
    },
  };

  message.embeds.push(embed)
  this.updateMessage(message)
}

exports.updateMessage = (message) => {
  FluxDispatcher.dirtyDispatch({
    type: 'MESSAGE_UPDATE',
    message
  })
}

exports.removeEmbed = (messageId, ChannelId) => {
  const message = getMessage(ChannelId, messageId);
  for (var embed in message.embeds) {
    if (message.embeds[embed].footer.text === "Made with ❤️ by c0dine and Sammy!") {
      message.embeds.splice(embed, 1);
    }
  }
  this.updateMessage(message);
}

exports.isImage = (url) => {
  if (url && url.match(/\.(jpeg|jpg|gif|png|webp)$/)) {
    if (url.includes('cdn.discordapp.com') || url.includes('media.discordapp.net')) {
      return url
    }
    return `https://images.weserv.nl/?url=${url}`;
  }
  return false;
}

exports.getImageResolutionByUrl = async (url) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => {
      reject();
    };
    img.src = url;
  });
}

exports.iteratePasswords = (passwords, ModalComposer, messageData) => {
  if (!passwords.length) return openModal(() => React.createElement(ModalComposer, messageData));
  let found = false;
  let processed = 0;
  let steggo = new StegCloak(true, false);
  passwords.forEach(async (password) => {
    let result = await steggo.reveal(messageData.content, password.password);
    processed++;
    if (this.isCorrectPassword(result) && !found) {
      found = true;
      result = result.replace('​', '');
      let url = result.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/) || [];
      return this.doEmbed(messageData.message, messageData.channel, result, url[0]);
    }
    if (processed === passwords.length) {
      if (!found) {
        return openModal(() => React.createElement(ModalComposer, messageData ));
      }
    }
  })
}

exports.isCorrectPassword = (result) => {
  return result.endsWith('​');
}