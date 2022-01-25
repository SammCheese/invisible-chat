// Some attribution to https://github.com/Sidemen19/send-button
const { React } = require("powercord/webpack");

const { Button } = require("powercord/components");
const f = require('../../components/Functions');


module.exports = ({ message }) => (
      <Button
        look={Button.Looks.SUCCESS}
        color={Button.Colors.BLUE}
        size={Button.Sizes.TINY}
        style={{ right: '70px', top: '25px' }}
        onClick={() => {
          f.removeEmbed(message.id, message.channel_id);
        }}
      >
        X
      </Button>
);
