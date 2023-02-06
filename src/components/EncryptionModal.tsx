import { common, components } from "replugged";
import { InvSettings, encrypt } from "../utils";

const { React } = common;
const { closeModal, openModal } = common.modal;
const { Button, Switch, Modal, Divider, TextInput, Text, Flex } = components;

let modalKey: any;

interface ModalProps {
  transitionState: any;
  onClose(): Promise<void>;
}

function EncModal(props: ModalProps) {
  const defaultPassword = InvSettings.get("defaultPassword", "password");

  let [secret, setSecret] = React.useState("");
  let [cover, setCover] = React.useState("");
  let [password, setPassword] = React.useState(defaultPassword);
  let [DontUseCover, setDontUseCover] = React.useState(false);

  const valid = secret && (DontUseCover || (cover && /\w \w/.test(cover)));

  return (
    <Modal.ModalRoot {...props}>
      <Modal.ModalHeader>
        <Text.H1>Encrypt Message</Text.H1>
      </Modal.ModalHeader>
      <Modal.ModalContent>
        <Text.Eyebrow style={{ marginTop: "10px", marginBottom: "5px" }}>
          Secret Message
        </Text.Eyebrow>
        <TextInput
          onChange={(e: string) => {
            setSecret(e);
          }}></TextInput>
        <Text.Eyebrow style={{ marginTop: "10px", marginBottom: "5px" }}>
          Cover (2 or more Words!!)
        </Text.Eyebrow>
        <TextInput
          disabled={DontUseCover}
          onChange={(e: string) => {
            setCover(e);
          }}></TextInput>
        <Text.Eyebrow style={{ marginTop: "10px", marginBottom: "5px" }}>Password</Text.Eyebrow>
        <TextInput
          placeholder={defaultPassword}
          onChange={(e: string) => {
            setPassword(e);
          }}></TextInput>
        <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />
        <Flex>
          <Switch
            checked={DontUseCover}
            onChange={(e: boolean) => {
              setDontUseCover(e);
            }}
          />
          <Text.Eyebrow style={{ left: "20px", top: "4px", position: "relative" }}>
            Dont use a Cover
          </Text.Eyebrow>
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
            const toSend = DontUseCover ? encrypted.replaceAll("d", "") : encrypted;
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
  modalKey = openModal((props: ModalProps) => <EncModal {...props} />);
}
