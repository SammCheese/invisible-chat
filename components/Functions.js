const StegCloak = require('stegcloak');
const { open: openModal } = require('powercord/modal');
const { getModule, FluxDispatcher, React } = require('powercord/webpack');

const { getMessage } = getModule(['getMessages'], false)

exports.doEmbedUpdate = (message, embed) => {
  message.embeds = message.embeds.map(this.cleanupEmbed);

  message.embeds.push(embed);
  this.updateMessage(message);
}

exports.doEmbed = async (messageId, ChannelId, content, url) => {
  let image = {};
  const message = await getMessage(ChannelId, messageId);

  content = content.replace('​', '');

  if (url && this.isImage(url)) {
    image = await this.getImageResolutionByUrl(url);
    image.url = url;
  }

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

  this.doEmbedUpdate(message, embed);
}

// Thank you Lighty <3
exports.cleanupEmbed = (embed) => {
  /* backported code from MLV2 rewrite */
  if (!embed.id) return embed; /* already cleaned */
  const retEmbed = {};
  if (typeof embed.rawTitle === 'string') retEmbed.title = embed.rawTitle;
  if (typeof embed.rawDescription === 'string') retEmbed.description = embed.rawDescription;
  if (typeof embed.referenceId !== 'undefined') retEmbed.reference_id = embed.referenceId;
  if (typeof embed.color === 'string') retEmbed.color = embed.color;
  if (typeof embed.type !== 'undefined') retEmbed.type = embed.type;
  if (typeof embed.url !== 'undefined') retEmbed.url = embed.url;
  if (typeof embed.provider === 'object') retEmbed.provider = { name: embed.provider.name, url: embed.provider.url };
  if (typeof embed.footer === 'object') retEmbed.footer = { text: embed.footer.text, icon_url: embed.footer.iconURL, proxy_icon_url: embed.footer.iconProxyURL };
  if (typeof embed.author === 'object') retEmbed.author = { name: embed.author.name, url: embed.author.url, icon_url: embed.author.iconURL, proxy_icon_url: embed.author.iconProxyURL };
  if (typeof embed.timestamp === 'object' && embed.timestamp._isAMomentObject) retEmbed.timestamp = embed.timestamp.milliseconds();
  if (typeof embed.thumbnail === 'object') {
    if (typeof embed.thumbnail.proxyURL === 'string' || (typeof embed.thumbnail.url === 'string' && !embed.thumbnail.url.endsWith('?format=jpeg'))) {
      retEmbed.thumbnail = {
        url: embed.thumbnail.url,
        proxy_url: typeof embed.thumbnail.proxyURL === 'string' ? embed.thumbnail.proxyURL.split('?format')[0] : undefined,
        width: embed.thumbnail.width,
        height: embed.thumbnail.height
      };
    }
  }
  if (typeof embed.image === 'object') {
    retEmbed.image = {
      url: embed.image.url,
      proxy_url: embed.image.proxyURL,
      width: embed.image.width,
      height: embed.image.height
    };
  }
  if (typeof embed.video === 'object') {
    retEmbed.video = {
      url: embed.video.url,
      proxy_url: embed.video.proxyURL,
      width: embed.video.width,
      height: embed.video.height
    };
  }
  if (Array.isArray(embed.fields) && embed.fields.length) {
    retEmbed.fields = embed.fields.map(e => ({ name: e.rawName, value: e.rawValue, inline: e.inline }));
  }
  return retEmbed;
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
    if (message.embeds[embed]?.footer?.text.includes("c0dine and Sammy!")) {
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

  // Allows AutoDecrypt to work with empty covers
  if (messageData.content.match(/^\W/)) messageData.content = `d ${messageData.content}d`;


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