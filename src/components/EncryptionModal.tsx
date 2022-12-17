import React from "react";
import { webpack } from "replugged";
import {
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalRoot,
  ModalSize,
  closeModal,
  openModal,
} from "./Modals";

import { encrypt } from "../index";

let TextInput: any;
let Button: any;
setTimeout(() => {
  TextInput = webpack.getByProps(["defaultProps", "Sizes", "contextType"]);
  Button = webpack.getByProps(["Hovers", "Looks", "Sizes"]);
}, 1500);

export function buildEncModal() {
  let secret: string;
  let cover: string;
  let password: string;
  const s = openModal!((props) => (
    <ModalRoot {...props} size={ModalSize.MEDIUM}>
      <ModalHeader>
        <div style={{ color: "gray", fontSize: "30px" }}>Encrypt Message</div>
      </ModalHeader>
      <ModalContent>
        <div style={{ color: "gray" }}>Secret</div>
        <TextInput
          onChange={(e: string) => {
            secret = e;
          }}></TextInput>
        <div style={{ color: "gray" }}>Cover</div>
        <TextInput
          onChange={(e: string) => {
            cover = e;
          }}></TextInput>
        <div style={{ color: "gray" }}>Password</div>
        <TextInput
          onChange={(e: string) => {
            password = e;
          }}></TextInput>
      </ModalContent>
      <ModalFooter>
        <Button
          onClick={() => {
            const toSend = encrypt(secret, password, cover);
            if (!toSend) return;

            webpack.common.messages.sendMessage(
              webpack.common.channels.getCurrentlySelectedChannelId(),
              { content: toSend },
            );
            // @ts-ignore
            closeModal(s);
          }}>
          Send
        </Button>
        <Button
          style={{ left: 15, position: "absolute" }}
          onClick={() => {
            // @ts-ignore
            closeModal(s);
          }}>
          Cancel
        </Button>
      </ModalFooter>
    </ModalRoot>
  ));
}
