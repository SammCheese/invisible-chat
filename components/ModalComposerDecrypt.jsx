// Tweaked Version of the ModalComposer found at https://github.com/Controlfreak707/safe-embed-generator/blob/master/components/GeneratorModal.jsx (Reqwrote not copy/paste)
const {
  React,
  messages,
  channels,
  getModuleByDisplayName,
} = require("powercord/webpack");
const { clipboard } = require("electron");
const { FormTitle, Button } = require("powercord/components");
const {
  TextAreaInput,
  SelectInput,
  SwitchItem,
  Category,
} = require("powercord/components/settings");
const { Modal } = require("powercord/components/modal");
const { close: closeModal } = require("powercord/modal");
const chatembed = require("../commands/chatembed")
const Functions = require("./Functions")
const Steggo = require("stegcloak");

module.exports = class ModalComposer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secret: this.props.content,
      password: "",
      inputted: false,
      categoryOpened: false,
      errors: [],
      hasError: false,
    };
  }

  inputted() {
    if (
      this.props.content != "" &&
      this.state.password != ""
    ) {
      this.setState({ inputted: true });
    } else {
      this.setState({ inputted: false });
    }
  }

  render() {
    var errorElement;
    const userPws = powercord.pluginManager.get("invisible-chat").settings.get("userPasswords");

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
          <FormTitle tag="h4">Message Decryptor</FormTitle>
        </Modal.Header>

        <Modal.Content>
          <TextAreaInput
            disabled={true}
            value={this.props.content}
            rows={1}
          >
            Secret Message
          </TextAreaInput>
          <TextAreaInput
            value={this.state.password}
            onChange={async (m) => {
              await this.setState({ password: m });
              this.inputted();
            }}
            rows={1}
          >
            Decryption Password
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
            Or Decrypt for a Registered User
          </SelectInput>}
          {!!userPws &&
          <div style={{height: "20px"}}></div>}
          {!userPws &&
          <h3 style={{color: 'white'}}>Tip: You can set Passwords for Specific Users in the Plugin Settings</h3>
          }
          {errorElement}
        </Modal.Content>

        <Modal.Footer>
          <Button
            color={Button.Colors.GREEN}
            disabled={!this.state.inputted}
            onClick={() => {
              try {
                const steggo = new Steggo(true);
                const Decrypted = steggo.reveal(this.state.secret, this.state.password)
                const UrlRegex = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/,"ig");

                if (Decrypted.match(UrlRegex)) {
                  return chatembed.executor(Decrypted, Decrypted.match(UrlRegex).toString()), closeModal();
                }
                return Functions.reply("Your Decrypted Message", `${steggo.reveal(
                  this.state.secret,
                  this.state.password
                )}`), closeModal();
              } catch (e) {
                this.handleError(e);
              }
            }}
          >
            Embed
          </Button>
          <Button
            style={{ marginRight: "10px" }}
            disabled={!this.state.inputted}
            onClick={() => {
              try {
                const steggo = new Steggo(true);
                clipboard.writeText(
                  `${steggo.reveal(
                    this.state.secret,
                    this.state.password
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
