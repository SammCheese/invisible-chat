import { common, components } from "replugged";

import { buildEmbed } from "../index";
import { InvSettings, decrypt } from "../utils";

const { React } = common;
const { Button, Modal, TextInput, Text } = components;
const { closeModal, openModal } = common.modal;

let modalKey: any;

interface ModalProps {
  transitionState: any;
  onClose(): Promise<void>;
}

function DecModal(props: ModalProps) {
  const defaultPassword = InvSettings.get("defaultPassword", "password");
  // @ts-ignore
  let secret: string = props?.message?.content;
  let [password, setPassword] = React.useState(defaultPassword);

  return (
    <Modal.ModalRoot {...props}>
      <Modal.ModalHeader>
        <Text.H1 style={{ fontSize: "30px" }}>Decrypt Message</Text.H1>
      </Modal.ModalHeader>
      <Modal.ModalContent>
        <Text.Eyebrow style={{ marginBottom: "5px" }}>Secret</Text.Eyebrow>
        <TextInput defaultValue={secret} disabled={true}></TextInput>
        <Text.Eyebrow style={{ marginBottom: "5px" }}>Password</Text.Eyebrow>
        <TextInput
          placeholder={defaultPassword}
          onChange={(e: string) => {
            setPassword(e);
          }}></TextInput>
        <div style={{ marginTop: 10 }} />
      </Modal.ModalContent>
      <Modal.ModalFooter>
        <Button
          color={Button.Colors.GREEN}
          onClick={() => {
            const toSend = decrypt(secret, password, true);
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
