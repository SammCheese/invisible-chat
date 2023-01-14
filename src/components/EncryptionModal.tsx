import { common, components } from "replugged";
import { encrypt } from "../index";

const { React } = common;
const { closeModal, openModal } = common.modal;
const { Button, SwitchItem, Modal, Divider, Input, Text, Flex } = components;

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
        <Text.H1>Encrypt Message</Text.H1>
      </Modal.ModalHeader>
      <Modal.ModalContent>
        <Text style={{ marginTop: "10px" }}>Secret Message</Text>
        <Input
          onChange={(e: string) => {
            setSecret(e);
          }}></Input>
        <Text style={{ marginTop: "10px" }}>Cover (2 or more Words!!)</Text>
        <Input
          disabled={DontUseCover}
          onChange={(e: string) => {
            setCover(e);
          }}></Input>
        <Text style={{ marginTop: "10px" }}>Password</Text>
        <Input
          placeholder="password"
          onChange={(e: string) => {
            setPassword(e);
          }}></Input>
        <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />
        <Flex>
          <SwitchItem
            checked={DontUseCover}
            onChange={(e: boolean) => {
              console.log(e);
              setDontUseCover(e);
            }}
          />
          <Text style={{ left: "20px", top: "4px", position: "relative" }}>Dont use a Cover</Text>
        </Flex>
        <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />
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
