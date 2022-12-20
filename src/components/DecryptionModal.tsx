import { common, webpack } from "replugged";
import {
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  ModalRoot,
  closeModal,
  openModal,
} from "./Modals";

import { buildEmbed, decrypt } from "../index";
const { React } = common;

const rawTextInput: any = webpack.waitForModule(
  webpack.filters.byProps("defaultProps", "Sizes", "contextType"),
);

const rawButton = webpack.waitForModule(webpack.filters.byProps("Hovers", "Looks", "Sizes"));

let Button: any;
let TextInput: any;

export async function initDecModal() {
  TextInput = webpack.getExportsForProps(await rawTextInput, ["contextType"]);
  Button = webpack.getExportsForProps(await rawButton, ["Link"]);
}

let modalKey: any;

function DecModal(props: ModalProps) {
  // @ts-ignore
  let secret: string = props?.message?.content;
  let [password, setPassword] = React.useState("password");

  return (
    <ModalRoot {...props}>
      <ModalHeader>
        <div style={{ color: "gray", fontSize: "30px" }}>Decrypt Message</div>
      </ModalHeader>
      <ModalContent>
        <div style={{ color: "gray" }}>Secret</div>
        <TextInput defaultValue={secret} disabled={true}></TextInput>
        <div style={{ color: "gray" }}>Password</div>
        <TextInput
          defaultValue={"password"}
          onChange={(e: string) => {
            setPassword(e);
          }}></TextInput>
        <div style={{ marginTop: 10 }} />
      </ModalContent>
      <ModalFooter>
        <Button
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

export function buildDecModal(msg: any): any {
  modalKey = openModal((props) => <DecModal {...props} {...msg} />);
}
