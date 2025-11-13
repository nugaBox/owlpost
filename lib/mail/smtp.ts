// OwlPost - SMTP 클라이언트

import nodemailer from "nodemailer";

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}

export interface SendMailOptions {
  from: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

export class SMTPClient {
  private transporter: nodemailer.Transporter;
  private config: SMTPConfig;

  constructor(smtpConfig: SMTPConfig) {
    this.config = smtpConfig;
    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("SMTP verification failed:", error);
      return false;
    }
  }

  async sendMail(options: SendMailOptions): Promise<nodemailer.SentMessageInfo> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: options.from,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(", ") : options.cc) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(", ") : options.bcc) : undefined,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments?.map((att) => ({
        filename: att.filename,
        path: att.path,
        content: att.content,
        contentType: att.contentType,
      })),
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async close(): Promise<void> {
    this.transporter.close();
  }
}
