/* eslint-disable no-unused-vars */
// Lots of shit is from VENCORD
// https://github.com/Vendicated/Vencord
// https://github.com/Vendicated/Vencord/blob/main/src/utils/modal.tsx

import { common, webpack } from "replugged";
const { React } = common;

enum ModalTransitionState {
  ENTERING,
  ENTERED,
  EXITING,
  EXITED,
  HIDDEN,
}

export enum ModalSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  DYNAMIC = "dynamic",
}

export interface ModalProps {
  transitionState: ModalTransitionState;
  onClose(): Promise<void>;
}

export interface ModalOptions {
  modalKey?: string;
  onCloseRequest?: () => void;
  onCloseCallback?: () => void;
}

/*interface ModalAPI {
  openModal: undefined | ((modal: any) => void);
  closeModal: undefined | ((modal: any) => void);
}*/

interface Modals {
  ModalRoot: any;
  ModalHeader: any;
  ModalContent: any;
  ModalFooter: any;
  ModalCloseButton: any;
}

interface ModalRootProps {
  transitionState?: ModalTransitionState;
  children: React.ReactNode;
  size?: ModalSize;
  role?: "alertdialog" | "dialog";
  className?: string;
  onAnimationEnd?(): string;
}

type RenderFunction = (props: ModalProps) => React.ReactNode;

export let ModalAPI: any;
export let Modals: Modals;

try {
  setTimeout(() => {
    // Populate ModalAPI
    ModalAPI = {
      openModal: webpack.getFunctionBySource(
        "onCloseRequest:null!=",
        webpack.getBySource("onCloseRequest:null!=")!,
      ),
      closeModal: webpack.getFunctionBySource(
        "onCloseCallback&&",
        webpack.getBySource("onCloseRequest:null!=")!,
      ),
    };
    // Populate Modal Types

    Modals = {
      ModalRoot: webpack.getFunctionBySource(
        "().root",
        webpack.getBySource("().closeWithCircleBackground")!,
      ),
      ModalHeader: webpack.getFunctionBySource(
        "().header",
        webpack.getBySource("().closeWithCircleBackground")!,
      ),
      ModalContent: webpack.getFunctionBySource(
        "().content",
        webpack.getBySource("().closeWithCircleBackground")!,
      ),
      ModalFooter: webpack.getFunctionBySource(
        "().footerSeparator",
        webpack.getBySource("().closeWithCircleBackground")!,
      ),
      ModalCloseButton: webpack.getFunctionBySource(
        "().closeWithCircleBackground",
        webpack.getBySource("().closeWithCircleBackground")!,
      ),
    };
  }, 1500);
} catch (e) {
  console.log(e);
}

export const ModalRoot = (props: ModalRootProps) => <Modals.ModalRoot {...props} />;
export const ModalHeader = (props: any) => <Modals.ModalHeader {...props} />;
export const ModalContent = (props: any) => <Modals.ModalContent {...props} />;
export const ModalFooter = (props: any) => <Modals.ModalFooter {...props} />;
export const ModalCloseButton = (props: any) => <Modals.ModalCloseButton {...props} />;

export function openModal(
  render: RenderFunction,
  options?: ModalOptions,
  contextKey?: string,
): void {
  return ModalAPI.openModal(render, options, contextKey);
}

/**
 * Close a modal by its key
 */
export function closeModal(modalKey: string, contextKey?: string): void {
  return ModalAPI.closeModal(modalKey, contextKey);
}
