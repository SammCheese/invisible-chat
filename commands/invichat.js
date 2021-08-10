const arg = require("arg");
const Steggo = require("stegcloak");
const { xtraParse } = require("../utilities/xtraHelp");
const Functions = require("../components/Functions");
const ERROR_MESSAGES = {
  cover: `**Missing required command argument "\`--cover || -c\`"**\n\nIf you need command help run \`.${this.commandName} --help [-h]\``,
  password: `**Missing required command argument "\`--password || -p\`"**\n\nIf you need command help run \`.${this.commandName} --help [-h]\``,
  none: `Didn't have any required arguments passed in the command!\nRun $\`${powercord.api.commands.prefix}help invichat\``,
}; // I Probably just Broke Error Handling
const InviChat = {
  handler: (args, props) => {
    // arg formatting
    const steggo = new Steggo(true, false);
    props.log(`Raw Arguments:\n${args.join(" ")}`);
    args = xtraParse(args);
    props.log(`Received args: ${JSON.stringify(args, null, 2)}`);

    var encryptedMessage;
    try {
      if (args.includes("-s") || args.includes("--secret")) {
        const argHandler = arg(
          {
            "--secret": String,
            "--password": String,
            "-s": "--secret",
            "-p": "--password",
          },
          {
            argv: args,
          }
        );
        if (!argHandler["--password"]) {
          Functions.replyError(ERROR_MESSAGES.password);
          return;
        }
        encryptedMessage = steggo.reveal(
          argHandler["--secret"],
          argHandler["--password"]
        );
        return encryptedMessage;
      } else if (args.includes("-m") || args.includes("--message")) {
        const argHandler = arg(
          {
            "--message": String,
            "--cover": String,
            "--password": String,
            "-m": "--message",
            "-c": "--cover",
            "-p": "--password",
          },
          {
            argv: args,
          }
        );
        props.log(
          `Received ArgHandler: ${JSON.stringify(argHandler, null, 2)}`
        );
        if (!argHandler["--cover"]) {
          Functions.replyError(ERROR_MESSAGES.cover);
          return;
        } else if (!argHandler["--password"]) {
          Functions.replyError(ERROR_MESSAGES.password);
          return;
        }
        encryptedMessage = steggo.hide(
          argHandler["--message"],
          argHandler["--password"],
          argHandler["--cover"]
        );
        return encryptedMessage;
      } else {
        props.replyError(ERROR_MESSAGES.none);
      }
    } catch (e) {
      props.settings.set("send", false);
      if (e.code === "ARG_UNKNOWN_OPTION") {
        Functions.replyError(e.message);
      } else {
        Functions.replyError(`${e.message}`);
      }
    }
  },
};

module.exports = InviChat;
