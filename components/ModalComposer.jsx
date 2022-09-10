const path = require("path");
const { clipboard } = require("electron");

const { Modal } = require("powercord/components/modal");
const { close: closeModal } = require("powercord/modal");
const { FormTitle, Button } = require("powercord/components");
const { React, getModule, channels } = require("powercord/webpack");
const { TextAreaInput, SelectInput, SwitchItem } = require("powercord/components/settings");

const { doEmbed, encrypt, decrypt } = require("./Functions");
const pluginName = path.basename(path.resolve(__dirname, '..'));
const { ComponentDispatch } = getModule([ 'ComponentDispatch' ], false);

let loading;

class ModalComposerDecrypt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      secret: this.props.content,
      password: "password",
      categoryOpened: false,
      errors: []
    };
  }

  componentWillUnmount() {
    loading = false;
  }

  render() {
    const SettingStore = powercord.pluginManager.get(pluginName)?.settings?.get('userPasswords', []) ?? [];

    let user;

    return(
      <Modal>
        <Modal.Header>
          <FormTitle tag='h4'>Decrypt Message</FormTitle>
        </Modal.Header>
        <Modal.Content>
          <div style={{ paddingTop: '10px'}}/>
        <TextAreaInput
          disabled={true}
          value={this.props.content}
          rows={1}
        >
          Secret Message
        </TextAreaInput>
        <TextAreaInput
          value={this.state.password}
          onChange={async (e) => {
            await this.setState({ password: e });
          }}
          rows={1}
        >
          Decryption Password
        </TextAreaInput>
        {!!SettingStore.length && 
          <SelectInput
            options={SettingStore.map(user => ({
                label: user.name,
                value: user.password
            }))}
            value={user ? user : ''}
            onChange={async (e) => {
              await this.setState({ password: e.value });
              user = e.label;
            }}
            rows={1}
          >
            or Decrypt for a Registered User
          </SelectInput>
        }
        {!!SettingStore.length && <div style={{ height: '20px'}}/>}
        {!SettingStore.length &&
          <h3 style={{ color: 'white' }}>
            Tip: You can set Passwords for Specific Users in the Plugin Settings
          </h3>
        }
        </Modal.Content>
        <Modal.Footer>
          <Button
            color={Button.Colors.GREEN}
            onClick={
              async () => {
                try {
                  loading = true;

                  if (this.state.secret.match(/^\W/)) this.state.secret = `d ${this.state.secret}d`;

                  const decrypted = await decrypt(this.state.secret, this.state.password);

                  let url = decrypted.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/) || [];
                  this.forceUpdate();

                  await doEmbed(this.props.message, this.props.channel, decrypted, url[0]);
                  closeModal();
                } catch (e) {
                  console.error(e);
                }
              }
            }
          >
            {loading ? 'Loading' : 'Decrypt'}
          </Button>
          <Button
            style={{ marginRight: '10px' }}
            onClick={async () => {
              try {
                if (this.state.secret.match(/^\W/)) this.state.secret = `d ${this.state.secret}d`;

                clipboard.writeText(
                  `${await decrypt(this.state.secret, this.state.password)}`
                );
                closeModal();
              } catch (e) {
                this.setState({ errors: [e] });
                console.error(e);
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
    )
  }

}




class ModalComposerEncrypt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secret: "",
      cover: "",
      password: "password",
      isValid: false,
      useNullText: false,
      errors: []
    };
  }

  isValid() {
    if (
      this.state.secret &&
      ((this.state.cover.split(' ').length >= 2 &&
      this.state.cover.split(' ')[1] && // Enforcing the 2 words, space is NOT a valid thing
      this.state.cover.split(' ')[0]) || 
      this.state.useNullText)
    ) {
      this.setState({ isValid: true });
    } else {
      this.setState({ isValid: false });
    }
  }

  render() {
    const SettingStore = powercord.pluginManager.get(pluginName)?.settings?.get('userPasswords', []) ?? [];

    let user;

    return(
      <Modal>
        <Modal.Header>
          <FormTitle tag='h4'>Invisible Message Creator</FormTitle>
        </Modal.Header>
        <Modal.Content>
          <div style={{ paddingTop: '10px'}}/>
          <TextAreaInput
            required={true}
            value={this.state.secret}
            onChange={async (m) => {
              await this.setState({ secret: m });
              this.isValid();
            }}
            rows={1}
          >
            Secret Message
          </TextAreaInput>
          <TextAreaInput
            value={this.state.cover}
            onChange={async (m) => {
              await this.setState({ cover: m });
              this.isValid();
            }}
            rows={1}
            required={true}
            disabled={this.state.useNullText}
            note={"WARNING: THIS WILL BE VISIBLE TO OTHERS!"}
          >
            Message Cover (More than 2 Words)
          </TextAreaInput>
          <TextAreaInput
            value={this.state.password}
            onChange={async (m) => {
              await this.setState({ password: m });
              this.isValid();
            }}
            rows={1}
            required={true}
          >
            Encryption Password
          </TextAreaInput>
          <SwitchItem
            value={this.state.useNullText}
            onChange={async (m) => {
              await this.setState({ useNullText: m });
              this.isValid();
            }}
          >
            Don't use a Cover
          </SwitchItem>
          {!!SettingStore.length &&
            <SelectInput
              options={SettingStore.map(user => ({
                label: user.name,
                value: user.password,
              }))}
              value={user || ''}
              onChange={async (e) => {
                await this.setState({ password: e.value });
                user = e.label;
                this.isValid();
              }}
              style={{ paddingBottom: '20px'}}
            >
              or encrypt for a specific User
            </SelectInput>
          }
        </Modal.Content>
        <Modal.Footer>
          <Button
            color={Button.Colors.GREEN}
            disabled={!this.state.isValid}
            onClick={async () => {
              try {
                const encrypted = await encrypt(
                  this.state.secret + '​', // \u200B
                  this.state.password,
                  this.state.useNullText ? 'd d ' : this.state.cover
                )

                const toSend = this.state.useNullText ?
                  encrypted.replaceAll('d', '') :
                  encrypted;

                ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
                  plainText: `${toSend}`
                })
                
                closeModal();
              } catch(e) {
                this.setState({ errors: [e.message] });
                console.error(e);
              }
            }}
          >
            Send
          </Button>
          <Button
            style={{ marginRight: '10px'}}
            disabled={!this.state.isValid}
            onClick={async () => {
              try {
                const encrypted = await encrypt(
                  this.state.secret + '​', // \u200B
                  this.state.password,
                  this.state.useNullText ? 'd d' : this.state.cover
                );

                this.state.useNullText ?
                  clipboard.writeText(`${encrypted.replaceAll('d', '').replaceAll(' ', '')}`) :
                  clipboard.writeText(encrypted)

                closeModal();
              } catch (e) {
                this.setState({ errors: [e.message] });
                console.error(e);
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
    )
  }
}

module.exports = {ModalComposerDecrypt, ModalComposerEncrypt};