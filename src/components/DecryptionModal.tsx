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

import { buildEmbed, decrypt } from "../index";

let TextInput: any;
let Button: any;
setTimeout(() => {
  TextInput = webpack.getByProps(["defaultProps", "Sizes", "contextType"]);
  Button = webpack.getByProps(["Hovers", "Looks", "Sizes"]);
}, 3500);

export function buildDecModal(msg: any) {
  let secret: string = msg?.content;
  let password: string = "password";
  if (!TextInput || !Button) return;
  if (!ModalRoot || !ModalContent || !ModalHeader || !ModalFooter) return;
  const s = openModal!((props = msg) => (
    <ModalRoot {...props} size={ModalSize.MEDIUM}>
      <ModalHeader>
        <div style={{ color: "gray", fontSize: "30px" }}>Decrypt Message</div>
      </ModalHeader>
      <ModalContent>
        <div style={{ color: "gray" }}>Secret</div>
        <TextInput defaultValue={msg.content} disabled={true}></TextInput>
        <div style={{ color: "gray" }}>Password</div>
        <TextInput
          onChange={(e: string) => {
            password = e;
          }}></TextInput>
      </ModalContent>
      <ModalFooter>
        <Button
          onClick={() => {
            const toSend = decrypt(secret, password);
            if (!toSend) return;
            buildEmbed(msg, toSend);
            // @ts-ignore
            closeModal(s);
          }}>
          Decrypt
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
