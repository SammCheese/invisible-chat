// Tweaked Version of the ModalComposer found at https://github.com/Controlfreak707/safe-embed-generator/blob/master/components/GeneratorModal.jsx (Reqwrote not copy/paste)
const {
  React,
  messages,
  channels,
  getModuleByDisplayName,
} = require("powercord/webpack");
const {
  TextAreaInput,
  SelectInput,
  SwitchItem,
  Category,
} = require("powercord/components/settings");

const { clipboard } = require("electron");
const { Modal } = require("powercord/components/modal");
const { close: closeModal } = require("powercord/modal");
const { FormTitle, Button } = require("powercord/components");

const path = require("path"); 
const Steggo = require("stegcloak");

module.exports = class ModalComposer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secret: "",
      cover: "",
      password: "",
      inputted: false,
      hmac: false,
      categoryOpened: false,
      errors: [],
      hasError: false,
    };
  }

  inputted() {
    if (
      this.state.secret != "" &&
      this.state.cover.split(" ").length >= 2 &&
      this.state.cover.split(" ")[1] != "" && // Enforcing the 2 words, space is NOT a valid thing
      this.state.cover.split(" ")[0] != "" &&
      this.state.password != ""
    ) {
      this.setState({ inputted: true });
    } else {
      this.setState({ inputted: false });
    }
  }

  render() {
    const foldername = path.basename(path.resolve(__dirname, '..')) || 'invisible-chat';
    let errorElement;
    const userPws = powercord.pluginManager
      .get(foldername)
      .settings.get("userPasswords");

    if (this.state.hasError) {
      errorElement = (
        <Category
          name="Errors"
          description="Errors are bad, tell me about them but use common sense :)"
          opened={this.state.categoryOpened}
          onChange={() => {
            this.setState({ categoryOpened: !this.state.categoryOpened });
          }}
        >
          {() => {
            //TODO: make this actually work
            for (var i = 0; i < this.state.errors.length; i++) {
              <div>
                <FormTitle>Error :(</FormTitle>
                <code className="inline">{this.state.errors[i]}</code>
              </div>;
            }
          }}
        </Category>
      );
    } else {
      errorElement = <div></div>;
    }
    return (
      <Modal className="powercord-text">
        <Modal.Header>
          <FormTitle tag="h4">Invisible Message Creator</FormTitle>
        </Modal.Header>

        <Modal.Content>
          <TextAreaInput
            value={this.state.secret}
            onChange={async (m) => {
              await this.setState({ secret: m });
              this.inputted();
            }}
            rows={1}
          >
            Secret Message
          </TextAreaInput>
          <TextAreaInput
            value={this.state.cover}
            onChange={async (m) => {
              await this.setState({ cover: m });
              this.inputted();
            }}
            rows={1}
            style={{
              color: (() => {
                if (this.state.coverError) {
                  return "#FF0000";
                }
              })(),
            }}
          >
            Message Cover (More than two words)
          </TextAreaInput>
          <TextAreaInput
            value={this.state.password}
            onChange={async (m) => {
              await this.setState({ password: m });
              this.inputted();
            }}
            rows={1}
          >
            Encryption Password
          </TextAreaInput>
          {!!userPws &&
          <SelectInput
            options={userPws.map((user) => ({
              label: user.name,
              value: user.password,
            }))}
            value={(label) => {}}
            onChange={async (e) => {
              await this.setState({ password: e.value });
              this.inputted();
            }}
            rows={1}
          >
            Or Encrypt for a Registered User
          </SelectInput>}
          <SwitchItem
            note="Encrypt the message using HMAC"
            value={this.state.hmac}
            onChange={() => {
              this.setState({ hmac: !this.state.hmac });
            }}
          >
            HMAC Encryption
          </SwitchItem>
          {errorElement}
        </Modal.Content>

        <Modal.Footer>
          <Button
            color={Button.Colors.GREEN}
            disabled={!this.state.inputted}
            onClick={() => {
              try {
                const steggo = new Steggo(true, this.state.hmac);
                messages.sendMessage(channels.getChannelId(), {
                  content: `${steggo.hide(
                    this.state.secret,
                    this.state.password,
                    this.state.cover
                  )}`,
                });
                closeModal();
              } catch (e) {
                this.handleError(e);
              }
            }}
          >
            Send
          </Button>
          <Button
            style={{ marginRight: "10px" }}
            disabled={!this.state.inputted}
            onClick={() => {
              try {
                const steggo = new Steggo(true, this.state.hmac);
                clipboard.writeText(
                  `${steggo.hide(
                    this.state.secret,
                    this.state.password,
                    this.state.cover
                  )}`
                );
                closeModal();
              } catch (e) {
                this.handleError(e);
              }
            }}
          >
            Copy
          </Button>
          <Button
            color={Button.Colors.TRANSPARENT}
            look={Button.Looks.LINK}
            onClick={closeModal}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  handleError(e) {
    this.setState({ hasError: true });
    this.setState({
      errors: (this.state.errors[this.state.errors.length + 1] = e),
    });
  }
};
