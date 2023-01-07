import { common, components, webpack } from "replugged";

import { buildEmbed, decrypt } from "../index";

const { React } = common;
const { Button, Modal } = components;
const { closeModal, openModal } = common.modal;

const FormText = components.FormText.DEFAULT;

const rawTextInput: any = webpack.waitForModule(
  webpack.filters.byProps("defaultProps", "Sizes", "contextType"),
);

let TextInput: any;

export async function initDecModal() {
  TextInput = webpack.getExportsForProps(await rawTextInput, ["contextType"]);
}

let modalKey: any;

interface ModalProps {
  transitionState: any;
  onClose(): Promise<void>;
}

function DecModal(props: ModalProps) {
  // @ts-ignore
  let secret: string = props?.message?.content;
  let [password, setPassword] = React.useState("password");

  return (
    <Modal.ModalRoot {...props}>
      <Modal.ModalHeader>
        <FormText style={{ fontSize: "30px" }}>Decrypt Message</FormText>
      </Modal.ModalHeader>
      <Modal.ModalContent>
        <FormText>Secret</FormText>
        <TextInput defaultValue={secret} disabled={true}></TextInput>
        <FormText>Password</FormText>
        <TextInput
          defaultValue={"password"}
          onChange={(e: string) => {
            setPassword(e);
          }}></TextInput>
        <div style={{ marginTop: 10 }} />
      </Modal.ModalContent>
      <Modal.ModalFooter>
        <Button
          color={Button.Colors.GREEN}
          onClick={() => {
            const toSend = decrypt(secret, password);
            if (!toSend) return;
            // @ts-ignore
            buildEmbed(props?.message, toSend);
            // @ts-ignore
            closeModal(modalKey);
          }}>
          Decrypt
        </Button>
        <Button
          color={Button.Colors.TRANSPARENT}
          look={Button.Looks.LINK}
          style={{ left: 15, position: "absolute" }}
          onClick={() => {
            // @ts-ignore
            closeModal(modalKey);
          }}>
          Cancel
        </Button>
      </Modal.ModalFooter>
    </Modal.ModalRoot>
  );
}

export function buildDecModal(msg: any): any {
  modalKey = openModal((props: JSX.IntrinsicAttributes & ModalProps) => (
    <DecModal {...props} {...msg} />
  ));
}
