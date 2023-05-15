/* eslint-disable @typescript-eslint/naming-convention */
type Constructor<StegCloak> = new (encrypt: boolean, useHmac: boolean) => Promise<StegCloak>;

interface StegCloak {
  hide: (secret: string, password: string, cover: string) => string;
  reveal: (secret: string, password: string) => string;
}

interface DiscordEmbedRequest {
  embeds: DiscordEmbed[];
}

interface StegCloakImport {
  default: Constructor<StegCloak>;
}

interface DiscordMedia {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

interface rawDiscordMedia extends Omit<DiscordMedia, "proxy_url"> {
  proxyURL: string;
}

interface DiscordEmbed {
  title: string;
  reference_id?: string;
  type: "rich" | "image" | "video" | "gifv" | "article" | "link";
  description: string;
  url?: string;
  timestamp?: ISO8601;
  color?: string | number;
  footer?: {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  image?: DiscordMedia;
  thumbnail?: DiscordMedia;
  video?: DiscordMedia;
  provider?: {
    name?: string;
    url?: string;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  fields?: [
    {
      name: string;
      value: string;
      inline?: boolean;
    },
  ];
}

interface rawDiscordEmbed {
  id: number;
  type: "rich" | "image" | "video" | "gifv" | "article" | "link";
  rawTitle: string;
  rawDescription: string;
  referenceId: string;
  url?: string;
  color?: string | number;
  timestamp: ISO8601;
  image?: rawDiscordMedia;
  thumbnail?: rawDiscordMedia;
  video?: rawDiscordMedia;
  footer?: {
    text: string;
    iconURL?: string;
    iconProxyURL?: string;
  };
  author?: {
    name: string;
    url?: string;
    iconURL?: string;
    iconProxyURL: string;
  };
  provider?: {
    name?: string;
    url?: string;
  };
  fields?: [
    {
      rawName: string;
      rawValue: string;
      inline?: boolean;
    },
  ];
}

interface ISO8601 {
  milliseconds: () => ISO8601;
  _isAMomentObject: boolean;
}

interface DiscordMessage {
  channel: object;
  content: string;
  embeds: Arrays<DiscordEmbed>;
}
