// @ts-nocheck

const { open: openModal } = require('powercord/modal');
const { getModule, FluxDispatcher, React } = require('powercord/webpack');

const { getMessage } = getModule(['getMessages'], false)

const path = require('path');
const pluginName = path.basename(path.join(__dirname, '..'))
const StegCloak = require('../utils/stegcloak')
const steggo = new StegCloak(true, false)


// Temporary Solution
const EMBED_URL = "https://EmbedBot.hubertmoszkarel.repl.co"

let isLoading = false;

/**
 * Gets a specific Setting
 * @param {String} setting 
 * @param {any} defaultValue 
 * @returns {any} any
 */
exports.getSetting = (setting, defaultValue) => {
  return powercord.pluginManager.get(pluginName).settings.get(setting, defaultValue);
}

exports.fetchEmbed = async (url) => {
  isLoading = true;

  return new Promise((resolve, reject) => {
    fetch(EMBED_URL, {
      method: "POST",
      body: JSON.stringify({
        url: url
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
      .then(json =>   {
        isLoading = false;
        resolve(json)
      })
      .catch(err => {
        isLoading = false;
        reject(new Error(err))
      })
  })

}

/**Removes detection string, fetches image data and builds the Embed
 * @param {Object} messageId 
 * @param {String} ChannelId 
 * @param {String} content 
 * @param {String} url 
 */
exports.doEmbed = async (messageId, ChannelId, content, url) => {
  const message = await getMessage(ChannelId, messageId);

  // Remove initial Detection String
  content = content.replace('​', '');

  // Build base embed
  let embed = {
    type: "rich",
    title: "Decrypted Message",
    color: "0x45f5f5",
    description: content,
    footer: {
      text: "Made with ❤️ by c0dine and Sammy!",
    }
  };
  
  if (url) {
    if (!isLoading) {
      try {
        const attMe = await this.fetchEmbed(url);
        console.log(attMe)
        attMe.footer = {
          text: "Made with ❤️ by c0dine and Sammy!"
        }
        message.embeds.push(attMe);
      } catch (e) {
        console.error(e);
      }
    }
  }
  
  message.embeds.push(embed)
  message.embeds = message.embeds.map(embed => this.cleanupEmbed(embed));
  this.updateMessage(message)
}

/**
 * Updates a Message
 * @param {Object} message 
 */
exports.updateMessage = (message) => {
  FluxDispatcher.dispatch({
    type: 'MESSAGE_UPDATE',
    message
  })
}

/**
 * Removes the Decryption Embed
 * @param {String} messageId 
 * @param {String} ChannelId 
 */
exports.removeEmbed = (messageId, ChannelId) => {
  const message = getMessage(ChannelId, messageId);

  for (var embed in message.embeds) {
    if (message.embeds[embed]?.footer?.text.includes("c0dine and Sammy!")) {
      message.embeds.splice(embed, 1);
    }
  }
  this.updateMessage(message);
}

/** Iterates through all registered Passwords and attempts to decrypt it, otherwise opens the ModalComposer
 * @param {Array} passwords 
 * @param {React.Component} ModalComposer 
 * @param {Object} messageData 
 * @returns 
 */
exports.iteratePasswords = (passwords, ModalComposer, messageData) => {
  if (!passwords.length) return openModal(() => React.createElement(ModalComposer, messageData));
  let found = false;
  let processed = 0;

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
        return ModalComposer ? openModal(() => React.createElement(ModalComposer, messageData )) : false;
      }
    }
  })
}

/**
 * Checks if the Password was correct
 * 
 * @param {String} result Decrypted Message
 * @returns {boolean} true | false
 */
exports.isCorrectPassword = (result) => {
  return result.endsWith('​');
}

/**
 * Encrypts Message
 * @param {String} secret 
 * @param {String} password 
 * @param {String} cover 
 * @returns {Promise<string>} Encrypted Message
 */
exports.encrypt = async (secret, password, cover) => {
  try {
    return await steggo.hide(secret + '​', password, cover);
  } catch (e) {
    return `We encountered an Error: ${e}`;
  }
}

/**
 * Decrypts Message
 * @param {String} secret 
 * @param {String} password 
 * @returns {Promise<string>} Decrypted Message 
 */
exports.decrypt = async (secret, password) => {
  try {
    return await steggo.reveal(secret, password);
  } catch (e) {
    return `We encountered an Error: ${e}`;
  }
}


/**
 * Reverts the embed object back to a usable object, Thank you Lighty <3
 * @param {Object} embed 
 * @returns 
 */
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
