// OwlPost - Nodemailer 모듈 타입 선언

declare module "nodemailer" {
  import { Readable } from "stream";

  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
    tls?: {
      rejectUnauthorized?: boolean;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface SendMailOptions {
    from?: string;
    to?: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename?: string;
      content?: string | Buffer | Readable;
      path?: string;
      contentType?: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  }

  export interface SentMessageInfo {
    messageId: string;
    accepted?: string[];
    rejected?: string[];
    pending?: string[];
    response?: string;
    [key: string]: any;
  }

  export interface Transporter {
    sendMail(mailOptions: SendMailOptions): Promise<SentMessageInfo>;
    verify(): Promise<boolean>;
    close(): Promise<void>;
  }

  export function createTransport(
    options: TransportOptions | string
  ): Transporter;

  const nodemailer: {
    createTransport: typeof createTransport;
    Transporter: typeof Transporter;
    SendMailOptions: SendMailOptions;
    SentMessageInfo: SentMessageInfo;
  };

  export default nodemailer;
}

