const { React } = require("powercord/webpack");
const f = require('../../components/Functions');
const { Modal } = require('powercord/components/modal')


module.exports = ({ message }) => (
      <Modal.CloseButton
        style={{ right: '70px' }}
        onClick={() => {
          f.removeEmbed(message.id, message.channel_id);
        }}
      />
);
