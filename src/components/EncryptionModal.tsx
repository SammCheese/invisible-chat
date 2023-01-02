import { common, components, webpack } from "replugged";

import { encrypt } from "../index";

const { React } = common;
// @ts-expect-error Package not updated yet
const { closeModal, openModal } = common.modal;
const { Button, SwitchItem, Modal, Divider } = components;
const FormText = components.FormText.DEFAULT;

const rawTextInput: any = webpack.waitForModule(
  webpack.filters.byProps("defaultProps", "Sizes", "contextType"),
);

let TextInput: any;

export async function initEncModal() {
  TextInput = webpack.getExportsForProps(await rawTextInput, ["contextType"]);
}

let modalKey: any;

interface ModalProps {
  transitionState: any;
  onClose(): Promise<void>;
}

function EncModal(props: ModalProps) {
  let [secret, setSecret] = React.useState("");
  let [cover, setCover] = React.useState("");
  let [password, setPassword] = React.useState("password");
  let [DontUseCover, setDontUseCover] = React.useState(false);

  const valid = secret && (DontUseCover || (cover && /\w \w/.test(cover)));

  return (
    <Modal.ModalRoot {...props}>
      <Modal.ModalHeader>
        <FormText style={{ fontSize: "30px" }}>Encrypt Message</FormText>
      </Modal.ModalHeader>
      <Modal.ModalContent>
        <FormText style={{ marginTop: "10px" }}>Secret Message</FormText>
        <TextInput
          onChange={(e: string) => {
            setSecret(e);
          }}></TextInput>
        <FormText style={{ marginTop: "10px" }}>Cover (2 or more Words!!)</FormText>
        <TextInput
          disabled={DontUseCover}
          onChange={(e: string) => {
            setCover(e);
          }}></TextInput>
        <FormText style={{ marginTop: "10px" }}>Password</FormText>
        <TextInput
          defaultValue={"password"}
          onChange={(e: string) => {
            setPassword(e);
          }}></TextInput>
        <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />
        <SwitchItem
          value={DontUseCover}
          onChange={(e: boolean) => {
            console.log(e);
            setDontUseCover(e);
          }}>
          Don't use a cover
        </SwitchItem>
      </Modal.ModalContent>
      <Modal.ModalFooter>
        <Button
          color={Button.Colors.GREEN}
          disabled={!valid}
          onClick={() => {
            if (!valid) return;
            const encrypted = encrypt(secret, password, DontUseCover ? "d d" : cover);
            const toSend = DontUseCover ? encrypted.replaceAll("d", "") : encrypt;
            if (!toSend) return;

            // @ts-expect-error
            common.messages.sendMessage(common.channels.getCurrentlySelectedChannelId(), {
              content: `${toSend}`,
            });
            closeModal(modalKey);
          }}>
          Send
        </Button>
        <Button
          color={Button.Colors.TRANSPARENT}
          look={Button.Looks.LINK}
          style={{ left: 15, position: "absolute" }}
          onClick={() => {
            closeModal(modalKey);
          }}>
          Cancel
        </Button>
      </Modal.ModalFooter>
    </Modal.ModalRoot>
  );
}

export function buildEncModal(): any {
  modalKey = openModal((props: JSX.IntrinsicAttributes & ModalProps) => <EncModal {...props} />);
}
