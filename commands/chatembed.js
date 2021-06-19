const { imageWH, reply, sendBotMessage } = require("../components/Functions");

let embed = {
  type: "rich",
  title: "Your Decrypted Message",
  description: "",
  image: {},
  color: "0x45f5f5",
  footer: {
    text: "Made with ❤️ by c0dine and Sammy!",
  },
};

module.exports = {
  executor: async (Data, MatchedUrl) => {
    reply(
      "Please Stand by...",
      "Getting your Message Ready...\n\n If the Image doesnt Load, please redecrypt it"
    );
    let wh = await imageWH(MatchedUrl);
    if (wh) {
      embed.description = Data;
      embed.image = {
        url: MatchedUrl,
        width: wh.width,
        height: wh.height,
      };
      return sendBotMessage(embed)
    }
    embed.description = Data;
    embed.image = { // Idk but it prevents cached images from reappearing
      url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png",
      width: 1,
      height: 1
    };
    return sendBotMessage(embed)
  },
};
