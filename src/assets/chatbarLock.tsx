import React from "react";
import { buildEncModal } from "../components/EncryptionModal";

export const chatbarLock = React.createElement(
  "svg",
  {
    key: "Encrypt Message",
    fill: "#EBEBEB",
    width: "30",
    height: "30",
    viewBox: "0 0 64 64",
    style: { marginTop: 7 },
    onClick: () => buildEncModal(),
  },
  React.createElement("path", {
    d: "M 32 9 C 24.832 9 19 14.832 19 22 L 19 27.347656 C 16.670659 28.171862 15 30.388126 15 33 L 15 49 C 15 52.314 17.686 55 21 55 L 43 55 C 46.314 55 49 52.314 49 49 L 49 33 C 49 30.388126 47.329341 28.171862 45 27.347656 L 45 22 C 45 14.832 39.168 9 32 9 z M 32 13 C 36.963 13 41 17.038 41 22 L 41 27 L 23 27 L 23 22 C 23 17.038 27.037 13 32 13 z",
  }),
);