// OwlPost - IMAP 클라이언트

import Imap from "imap";
import { simpleParser } from "mailparser";

export interface IMAPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}

export interface MailMessage {
  uid: number;
  flags: string[];
  date: Date;
  subject: string;
  from: string;
  to: string[];
  body: string;
  htmlBody?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    content: Buffer;
  }>;
}

export class IMAPClient {
  private imap: Imap;
  private config: IMAPConfig;
  private connected: boolean = false;

  constructor(imapConfig: IMAPConfig) {
    this.config = imapConfig;
    this.imap = new Imap({
      user: imapConfig.username,
      password: imapConfig.password,
      host: imapConfig.host,
      port: imapConfig.port,
      tls: imapConfig.secure,
      tlsOptions: {
        rejectUnauthorized: false,
      },
    });
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.imap.once("ready", () => {
        this.connected = true;
        resolve();
      });

      this.imap.once("error", (err: Error) => {
        this.connected = false;
        reject(err);
      });

      this.imap.connect();
    });
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    return new Promise((resolve) => {
      this.imap.end();
      this.imap.once("end", () => {
        this.connected = false;
        resolve();
      });
    });
  }

  async openBox(boxName: string = "INBOX"): Promise<Imap.Box> {
    if (!this.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.imap.openBox(boxName, false, (err, box) => {
        if (err) reject(err);
        else resolve(box);
      });
    });
  }

  async getMailboxes(): Promise<string[]> {
    if (!this.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.imap.getBoxes((err, boxes) => {
        if (err) {
          reject(err);
          return;
        }

        const boxNames: string[] = [];
        const traverse = (box: Imap.MailBox, prefix: string = "") => {
          boxNames.push(prefix);
          if (box.children) {
            Object.keys(box.children).forEach((child) => {
              traverse(box.children[child], prefix ? `${prefix}/${child}` : child);
            });
          }
        };

        Object.keys(boxes).forEach((name) => {
          traverse(boxes[name], name);
        });

        resolve(boxNames);
      });
    });
  }

  async fetchMessages(
    boxName: string = "INBOX",
    limit: number = 50,
    startFrom: number = 1
  ): Promise<MailMessage[]> {
    await this.openBox(boxName);

    return new Promise((resolve, reject) => {
      this.imap.search(["ALL"], (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        if (results.length === 0) {
          resolve([]);
          return;
        }

        // 최신 메일부터 가져오기
        const uids = results.slice(-limit).reverse();
        const fetch = this.imap.fetch(uids, {
          bodies: "",
          struct: true,
        });

        const messages: MailMessage[] = [];

        fetch.on("message", (msg, seqno) => {
          let uid: number = 0;
          let flags: string[] = [];
          let date: Date = new Date();
          let subject: string = "";
          let from: string = "";
          let to: string[] = [];
          let body: string = "";
          let htmlBody: string | undefined;
          let attachments: Array<{
            filename: string;
            contentType: string;
            content: Buffer;
          }> = [];

          msg.on("body", (stream, info) => {
            let buffer = "";
            stream.on("data", (chunk) => {
              buffer += chunk.toString("utf8");
            });
            stream.on("end", async () => {
              try {
                const parsed = await simpleParser(buffer);
                subject = parsed.subject || "";
                from = parsed.from?.text || "";
                to = parsed.to ? parsed.to.map((addr) => addr.text || addr.address || "") : [];
                body = parsed.text || "";
                htmlBody = parsed.html || undefined;

                if (parsed.attachments) {
                  attachments = parsed.attachments.map((att) => ({
                    filename: att.filename || "attachment",
                    contentType: att.contentType || "application/octet-stream",
                    content: att.content as Buffer,
                  }));
                }
              } catch (parseErr) {
                console.error("Mail parsing error:", parseErr);
              }
            });
          });

          msg.once("attributes", (attrs) => {
            uid = attrs.uid || 0;
            flags = attrs.flags || [];
            date = attrs.date || new Date();
          });

          msg.once("end", () => {
            messages.push({
              uid,
              flags,
              date,
              subject,
              from,
              to,
              body,
              htmlBody,
              attachments: attachments.length > 0 ? attachments : undefined,
            });
          });
        });

        fetch.once("error", (err) => {
          reject(err);
        });

        fetch.once("end", () => {
          resolve(messages);
        });
      });
    });
  }

  async getMessage(uid: number, boxName: string = "INBOX"): Promise<MailMessage | null> {
    await this.openBox(boxName);

    return new Promise((resolve, reject) => {
      const fetch = this.imap.fetch([uid], {
        bodies: "",
        struct: true,
      });

      let message: MailMessage | null = null;

      fetch.on("message", (msg) => {
        let uid: number = 0;
        let flags: string[] = [];
        let date: Date = new Date();
        let subject: string = "";
        let from: string = "";
        let to: string[] = [];
        let body: string = "";
        let htmlBody: string | undefined;
        let attachments: Array<{
          filename: string;
          contentType: string;
          content: Buffer;
        }> = [];

        msg.on("body", (stream) => {
          let buffer = "";
          stream.on("data", (chunk) => {
            buffer += chunk.toString("utf8");
          });
          stream.on("end", async () => {
            try {
              const parsed = await simpleParser(buffer);
              subject = parsed.subject || "";
              from = parsed.from?.text || "";
              to = parsed.to ? parsed.to.map((addr) => addr.text || addr.address || "") : [];
              body = parsed.text || "";
              htmlBody = parsed.html || undefined;

              if (parsed.attachments) {
                attachments = parsed.attachments.map((att) => ({
                  filename: att.filename || "attachment",
                  contentType: att.contentType || "application/octet-stream",
                  content: att.content as Buffer,
                }));
              }
            } catch (parseErr) {
              console.error("Mail parsing error:", parseErr);
            }
          });
        });

        msg.once("attributes", (attrs) => {
          uid = attrs.uid || 0;
          flags = attrs.flags || [];
          date = attrs.date || new Date();
        });

        msg.once("end", () => {
          message = {
            uid,
            flags,
            date,
            subject,
            from,
            to,
            body,
            htmlBody,
            attachments: attachments.length > 0 ? attachments : undefined,
          };
        });
      });

      fetch.once("error", (err) => {
        reject(err);
      });

      fetch.once("end", () => {
        resolve(message);
      });
    });
  }
}
