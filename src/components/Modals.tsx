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
  /* eslint-disable */
  children: React.ReactNode;
  size?: ModalSize;
  role?: "alertdialog" | "dialog";
  className?: string;
  onAnimationEnd?(): string;
}

type RenderFunction = (props: ModalProps) => React.ReactNode;

export let ModalAPI: any;
export let Modals: Modals;

export async function initModals() {
  let rawModalModule = webpack.waitForModule(webpack.filters.bySource("onCloseRequest:null!="));
  let rawModalsModule = webpack.waitForModule(
    webpack.filters.bySource("().closeWithCircleBackground"),
  );

  ModalAPI = {
    // @ts-ignore
    openModal: webpack.getFunctionBySource("onCloseRequest:null!=", await rawModalModule),
    // @ts-ignore
    closeModal: webpack.getFunctionBySource("onCloseCallback&&", await rawModalModule),
  };

  Modals = {
    // @ts-ignore
    ModalRoot: webpack.getFunctionBySource("().root", await rawModalsModule),
    // @ts-ignore
    ModalHeader: webpack.getFunctionBySource("().header", await rawModalsModule)!,
    // @ts-ignore
    ModalContent: webpack.getFunctionBySource("().content", await rawModalsModule)!,
    // @ts-ignore
    ModalFooter: webpack.getFunctionBySource("().footerSeparator", await rawModalsModule)!,
    ModalCloseButton: webpack.getFunctionBySource(
      "().closeWithCircleBackground",
      // @ts-ignore
      await rawModalsModule,
    )!,
  };
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
): string {
  return ModalAPI.openModal(render, options, contextKey);
}

/**
 * Close a modal by its key
 */
export function closeModal(modalKey: string, contextKey?: string): void {
  return ModalAPI.closeModal(modalKey, contextKey);
}
