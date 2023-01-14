import { common, components } from "replugged";

import { buildEmbed, decrypt } from "../index";

const { React } = common;
const { Button, Modal, Input, Text } = components;
const { closeModal, openModal } = common.modal;

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
        <Text.H1 style={{ fontSize: "30px" }}>Decrypt Message</Text.H1>
      </Modal.ModalHeader>
      <Modal.ModalContent>
        <Text>Secret</Text>
        {/* @ts-expect-error faulty type */}
        <Input defaultValue={secret} disabled={true}></Input>
        <Text>Password</Text>
        <Input
          placeholder="password"
          onChange={(e: string) => {
            setPassword(e);
          }}></Input>
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
