/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { addButton, removeButton } from "@api/MessagePopover";
import definePlugin from "@utils/types";
import { makeLazy } from "@utils/misc"
import { ChannelStore, FluxDispatcher } from "@webpack/common";

import { buildDecModal } from "./components/DecryptionModal";
import { buildEncModal } from "./components/EncryptionModal";

export const getStegCloak = makeLazy(() => import("https://unpkg.com/stegcloak-dist@1.0.0/index.js"));

let StegCloak;
let steggo;

const PopoverIcon = () => {
    return (
        <svg
            fill={"var(--header-secondary)"}
            width={24} height={24}
            viewBox={"0 0 64 64"}
        >
            <path d="M 32 9 C 24.832 9 19 14.832 19 22 L 19 27.347656 C 16.670659 28.171862 15 30.388126 15 33 L 15 49 C 15 52.314 17.686 55 21 55 L 43 55 C 46.314 55 49 52.314 49 49 L 49 33 C 49 30.388126 47.329341 28.171862 45 27.347656 L 45 22 C 45 14.832 39.168 9 32 9 z M 32 13 C 36.963 13 41 17.038 41 22 L 41 27 L 23 27 L 23 22 C 23 17.038 27.037 13 32 13 z" />
        </svg>
    );
};


function Indicator() {
    return (
        <img src="https://github.com/SammCheese/invisible-chat/raw/NewReplugged/src/assets/lock.png" width={20} style={{ marginBottom: -4 }}>
        </img>
    );

}

function ChatbarIcon() {
    return (
        <svg
            key="Encrypt Message"
            fill={"var(--header-secondary)"}
            width="30"
            height="30"
            viewBox={"0 0 64 64"}
            style={{ marginTop: 7 }}
            onClick={() => buildEncModal()}
        >
            <path d="M 32 9 C 24.832 9 19 14.832 19 22 L 19 27.347656 C 16.670659 28.171862 15 30.388126 15 33 L 15 49 C 15 52.314 17.686 55 21 55 L 43 55 C 46.314 55 49 52.314 49 49 L 49 33 C 49 30.388126 47.329341 28.171862 45 27.347656 L 45 22 C 45 14.832 39.168 9 32 9 z M 32 13 C 36.963 13 41 17.038 41 22 L 41 27 L 23 27 L 23 22 C 23 17.038 27.037 13 32 13 z" />
        </svg>
    );
}


export default definePlugin({
    name: "InvisibleChat",
    description: "Encrypt your Messages in a non-suspicious way! This plugin makes requests to >>https://embed.sammcheese.net<< to provide embeds to decrypted links!",
    authors: [
        {
            name: "Samm-Cheese",
            id: 372148345894076416n
        }
    ],
    patches: [
        {
            // Indicator
            find: ".Messages.MESSAGE_EDITED,",
            replacement: {
                match: /var .,.,.=(.)\.className,.=.\.message,.=.\.children,.=.\.content,.=.\.onUpdate/gm,
                replace: "try{$1?.content[0].match(Vencord.Plugins.plugins.InvisibleChat.INV_DETECTION)?$1?.content.push(Vencord.Plugins.plugins.InvisibleChat.indicator()):null}catch(e){};$&"
            }
        },
        {
            find: ".activeCommandOption",
            replacement: {
                match: /.=.\.activeCommand,.=.\.activeCommandOption,.{1,133}(.)=\[\];/,
                replace: "$&;$1.push(Vencord.Plugins.plugins.InvisibleChat.chatbarIcon());",
            }
        },
    ],
    EMBED_URL: "https://embed.sammcheese.net",
    INV_DETECTION: new RegExp(/( \u200c|\u200d |[\u2060-\u2064])[^\u200b]/),
    URL_DETECTION: new RegExp(
        /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/,
    ),
    async start() {
        // Shitty Module initialization. Thanks Ven.
        StegCloak = await getStegCloak();
        steggo = new StegCloak.default(true, false);

        addButton("invDecrypt", message => {
            return message?.content.match(this.INV_DETECTION) ?
                {
                    label: "Decrypt Message",
                    icon: this.popoverIcon,
                    message: message,
                    channel: ChannelStore.getChannel(message.channel_id),
                    onClick: () => buildDecModal({ message })
                } : null;
        });
    },
    stop() {
        removeButton("invDecrypt");
    },
    // Gets the Embed of a Link
    async getEmbed(url: URL): Promise<Object | {}> {
        const controller = new AbortController();
        const _timeout = setTimeout(() => controller.abort(), 5000);

        const options = {
            signal: controller.signal,
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: url,
            }),
        };

        // AWS hosted url to discord embed object
        const rawRes = await fetch(this.EMBED_URL, options);
        return await rawRes.json();
    },
    async buildEmbed(message: any, revealed: string): Promise<void> {
        const urlCheck = revealed.match(this.URL_DETECTION) || [];

        let attachment;
        if (urlCheck[0]) attachment = await this.getEmbed(new URL(urlCheck[0]));

        const embed = {
            type: "rich",
            title: "Decrypted Message",
            color: "0x45f5f5",
            description: revealed,
            footer: {
                text: "Made with ❤️ by c0dine and Sammy!",
            },
        };

        message.embeds.push(embed);
        if (attachment) message.embeds.push(attachment);
        this.updateMessage(message);
        return Promise.resolve();
    },
    updateMessage: (message: any) => {
        FluxDispatcher.dispatch({
            type: "MESSAGE_UPDATE",
            message,
        });
    },
    chatbarIcon: ChatbarIcon,
    popoverIcon: () => <PopoverIcon />,
    indicator: Indicator
});

export function encrypt(secret: string, password: string, cover: string): string {
    // \u200b appended to secret for detection of string
    return steggo.hide(secret + "​", password, cover);
}

export function decrypt(secret: string, password: string): string {
    // eslint-disable-next-line no-irregular-whitespace
    return steggo.reveal(secret, password).replace("​", "");
}

