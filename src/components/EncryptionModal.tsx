import { common, webpack } from "replugged";
import {
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  ModalRoot,
  ModalSize,
  closeModal,
  openModal,
} from "./Modals";

import { encrypt } from "../index";

const { React } = common;

const rawTextInput: any = webpack.waitForModule(
  webpack.filters.byProps("defaultProps", "Sizes", "contextType"),
);

const rawButton = webpack.waitForModule(webpack.filters.byProps("Hovers", "Looks", "Sizes"));

let Button: any;
let TextInput: any;

export async function initEncModal() {
  TextInput = webpack.getExportsForProps(await rawTextInput, ["contextType"]);
  Button = webpack.getExportsForProps(await rawButton, ["Link"]);
}

let modalKey: any;

export function EncModal(props: ModalProps) {
  let [secret, setSecret] = React.useState("");
  let [cover, setCover] = React.useState("");
  let [password, setPassword] = React.useState("password");

  const valid = secret && cover && /\w \w/.test(cover);

  return (
    <ModalRoot {...props} size={ModalSize.MEDIUM}>
      <ModalHeader>
        <div style={{ color: "gray", fontSize: "30px" }}>Encrypt Message</div>
      </ModalHeader>
      <ModalContent>
        <div style={{ color: "gray" }}>Secret</div>
        <TextInput
          onChange={(e: string) => {
            setSecret(e);
          }}></TextInput>
        <div style={{ color: "gray" }}>Cover (2 or more Words!!)</div>
        <TextInput
          onChange={(e: string) => {
            setCover(e);
          }}></TextInput>
        <div style={{ color: "gray" }}>Password</div>
        <TextInput
          defaultValue={"password"}
          onChange={(e: string) => {
            setPassword(e);
          }}></TextInput>
      </ModalContent>
      <ModalFooter>
        <Button
          disabled={!valid}
          onClick={() => {
            if (!valid) return;
            const toSend = encrypt(secret, password, cover);
            if (!toSend) return;

            // @ts-expect-error
            common.messages.sendMessage(common.channels.getCurrentlySelectedChannelId(), {
              content: `${toSend}`,
            });
            // @ts-ignore
            closeModal(modalKey);
          }}>
          Send
        </Button>
        <Button
          style={{ left: 15, position: "absolute" }}
          onClick={() => {
            // @ts-ignore
            closeModal(modalKey);
          }}>
          Cancel
        </Button>
      </ModalFooter>
    </ModalRoot>
  );
}

export function buildEncModal(): any {
  modalKey = openModal((props) => <EncModal {...props} />);
}
