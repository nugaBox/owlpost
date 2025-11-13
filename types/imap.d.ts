// OwlPost - IMAP 모듈 타입 선언

declare module "imap" {
  import { EventEmitter } from "events";

  export interface Config {
    user: string;
    password: string;
    host: string;
    port: number;
    tls?: boolean;
    tlsOptions?: {
      rejectUnauthorized?: boolean;
      [key: string]: any;
    };
    connTimeout?: number;
    authTimeout?: number;
    keepalive?: boolean | {
      interval?: number;
      idleInterval?: number;
      forceNoKeepalive?: boolean;
    };
    [key: string]: any;
  }

  export interface Box {
    name: string;
    readOnly: boolean;
    newKeywords: boolean;
    uidvalidity: number;
    uidnext: number;
    flags: string[];
    permFlags: string[];
    persistentUIDs: boolean;
    messages: {
      total: number;
      new: number;
      unseen: number;
    };
  }

  export interface MailBox {
    attribs: string[];
    delimiter: string;
    children?: {
      [key: string]: MailBox;
    };
    parent?: MailBox;
  }

  export interface MessageAttributes {
    uid?: number;
    flags?: string[];
    date?: Date;
    struct?: any;
    [key: string]: any;
  }

  export interface FetchOptions {
    bodies?: string | string[];
    struct?: boolean;
    size?: boolean;
    uid?: boolean;
    [key: string]: any;
  }

  export interface ImapMessage extends EventEmitter {
    on(event: "body", listener: (stream: NodeJS.ReadableStream, info: any) => void): this;
    on(event: "attributes", listener: (attrs: MessageAttributes) => void): this;
    on(event: "end", listener: () => void): this;
    once(event: "body", listener: (stream: NodeJS.ReadableStream, info: any) => void): this;
    once(event: "attributes", listener: (attrs: MessageAttributes) => void): this;
    once(event: "end", listener: () => void): this;
  }

  export interface ImapFetch extends EventEmitter {
    on(event: "message", listener: (msg: ImapMessage, seqno: number) => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "end", listener: () => void): this;
    once(event: "message", listener: (msg: ImapMessage, seqno: number) => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "end", listener: () => void): this;
  }

  class Imap extends EventEmitter {
    constructor(config: Config);

    connect(): void;
    end(): void;

    openBox(mailboxName: string, openReadOnly: boolean, callback: (err: Error | null, box: Box) => void): void;
    closeBox(callback: (err: Error | null) => void): void;

    getBoxes(callback: (err: Error | null, boxes: { [key: string]: MailBox }) => void): void;
    getBoxes(mailboxName: string, callback: (err: Error | null, boxes: { [key: string]: MailBox }) => void): void;

    search(criteria: any[], callback: (err: Error | null, uids: number[]) => void): void;
    fetch(source: any, options: FetchOptions): ImapFetch;

    addFlags(source: any, flags: string[], callback: (err: Error | null) => void): void;
    delFlags(source: any, flags: string[], callback: (err: Error | null) => void): void;
    setFlags(source: any, flags: string[], callback: (err: Error | null) => void): void;

    on(event: "ready", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "close", listener: (hadError: boolean) => void): this;
    once(event: "ready", listener: () => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "end", listener: () => void): this;
    once(event: "close", listener: (hadError: boolean) => void): this;
  }

  export = Imap;
}

