// OwlPost - JMAP 클라이언트 (Stalwart Mail 연동)

export interface JMAPConfig {
  url: string;
  username: string;
  password: string;
}

export interface JMAPMailbox {
  id: string;
  name: string;
  role?: string;
  totalEmails?: number;
  unreadEmails?: number;
}

export interface JMAPMessage {
  id: string;
  mailboxIds: string[];
  threadId: string;
  subject?: string;
  from?: Array<{ email: string; name?: string }>;
  to?: Array<{ email: string; name?: string }>;
  cc?: Array<{ email: string; name?: string }>;
  date?: string;
  preview?: string;
  hasAttachment?: boolean;
  isUnread?: boolean;
  isFlagged?: boolean;
}

export interface JMAPEmailBody {
  textBody?: string;
  htmlBody?: string;
  attachments?: Array<{
    blobId: string;
    type: string;
    name: string;
    size: number;
  }>;
}

export class JMAPClient {
  private config: JMAPConfig;
  private sessionUrl: string;
  private apiUrl: string;
  private accessToken: string | null = null;
  private apiUrlFromSession: string | null = null;

  constructor(jmapConfig: JMAPConfig) {
    this.config = jmapConfig;
    this.sessionUrl = `${jmapConfig.url}/.well-known/jmap`;
    this.apiUrl = jmapConfig.url;
  }

  /**
   * JMAP 세션 가져오기 및 인증
   */
  async authenticate(): Promise<void> {
    try {
      // Basic 인증으로 세션 정보 가져오기
      const auth = Buffer.from(
        `${this.config.username}:${this.config.password}`
      ).toString("base64");

      const response = await fetch(this.sessionUrl, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`JMAP authentication failed: ${response.statusText}`);
      }

      const session = await response.json();
      this.apiUrlFromSession = session.apiUrl || this.apiUrl;
      this.accessToken = auth; // Stalwart는 Basic 인증 사용 가능

      return;
    } catch (error) {
      console.error("JMAP authentication error:", error);
      throw error;
    }
  }

  /**
   * 메일박스 목록 가져오기
   */
  async getMailboxes(): Promise<JMAPMailbox[]> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const apiUrl = this.apiUrlFromSession || this.apiUrl;
    const auth = Buffer.from(
      `${this.config.username}:${this.config.password}`
    ).toString("base64");

    const response = await fetch(`${apiUrl}/jmap`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        using: [
          "urn:ietf:params:jmap:core",
          "urn:ietf:params:jmap:mail",
        ],
        methodCalls: [
          [
            "Mailbox/get",
            {
              accountId: this.config.username, // Stalwart는 username을 accountId로 사용
            },
            "0",
          ],
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`JMAP getMailboxes failed: ${response.statusText}`);
    }

    const data = await response.json();
    const mailboxes = data.methodResponses?.[0]?.[1]?.list || [];

    return mailboxes.map((mb: any) => ({
      id: mb.id,
      name: mb.name,
      role: mb.role,
      totalEmails: mb.totalEmails,
      unreadEmails: mb.unreadEmails,
    }));
  }

  /**
   * 메시지 목록 가져오기
   */
  async getMessages(
    mailboxId: string,
    limit: number = 50,
    position: number = 0
  ): Promise<JMAPMessage[]> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const apiUrl = this.apiUrlFromSession || this.apiUrl;
    const auth = Buffer.from(
      `${this.config.username}:${this.config.password}`
    ).toString("base64");

    const response = await fetch(`${apiUrl}/jmap`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        using: [
          "urn:ietf:params:jmap:core",
          "urn:ietf:params:jmap:mail",
        ],
        methodCalls: [
          [
            "Email/query",
            {
              accountId: this.config.username,
              filter: {
                inMailbox: mailboxId,
              },
              sort: [
                {
                  property: "receivedAt",
                  isAscending: false,
                },
              ],
              limit: limit,
              position: position,
            },
            "0",
          ],
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`JMAP getMessages failed: ${response.statusText}`);
    }

    const data = await response.json();
    const messageIds = data.methodResponses?.[0]?.[1]?.ids || [];

    if (messageIds.length === 0) {
      return [];
    }

    // 메시지 상세 정보 가져오기
    const detailResponse = await fetch(`${apiUrl}/jmap`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        using: [
          "urn:ietf:params:jmap:core",
          "urn:ietf:params:jmap:mail",
        ],
        methodCalls: [
          [
            "Email/get",
            {
              accountId: this.config.username,
              ids: messageIds,
              properties: [
                "id",
                "mailboxIds",
                "threadId",
                "subject",
                "from",
                "to",
                "cc",
                "date",
                "preview",
                "hasAttachment",
                "keywords",
              ],
            },
            "1",
          ],
        ],
      }),
    });

    if (!detailResponse.ok) {
      throw new Error(`JMAP getMessageDetails failed: ${detailResponse.statusText}`);
    }

    const detailData = await detailResponse.json();
    const messages = detailData.methodResponses?.[0]?.[1]?.list || [];

    return messages.map((msg: any) => ({
      id: msg.id,
      mailboxIds: msg.mailboxIds || [],
      threadId: msg.threadId,
      subject: msg.subject,
      from: msg.from,
      to: msg.to,
      cc: msg.cc,
      date: msg.date,
      preview: msg.preview,
      hasAttachment: msg.hasAttachment || false,
      isUnread: !msg.keywords?.$seen,
      isFlagged: msg.keywords?.$flagged || false,
    }));
  }

  /**
   * 메시지 상세 정보 가져오기
   */
  async getMessage(messageId: string): Promise<{
    message: JMAPMessage;
    body: JMAPEmailBody;
  } | null> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const apiUrl = this.apiUrlFromSession || this.apiUrl;
    const auth = Buffer.from(
      `${this.config.username}:${this.config.password}`
    ).toString("base64");

    const response = await fetch(`${apiUrl}/jmap`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        using: [
          "urn:ietf:params:jmap:core",
          "urn:ietf:params:jmap:mail",
        ],
        methodCalls: [
          [
            "Email/get",
            {
              accountId: this.config.username,
              ids: [messageId],
              properties: [
                "id",
                "mailboxIds",
                "threadId",
                "subject",
                "from",
                "to",
                "cc",
                "bcc",
                "date",
                "preview",
                "hasAttachment",
                "keywords",
                "textBody",
                "htmlBody",
                "attachments",
              ],
            },
            "0",
          ],
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`JMAP getMessage failed: ${response.statusText}`);
    }

    const data = await response.json();
    const messages = data.methodResponses?.[0]?.[1]?.list || [];

    if (messages.length === 0) {
      return null;
    }

    const msg = messages[0];

    return {
      message: {
        id: msg.id,
        mailboxIds: msg.mailboxIds || [],
        threadId: msg.threadId,
        subject: msg.subject,
        from: msg.from,
        to: msg.to,
        cc: msg.cc,
        date: msg.date,
        preview: msg.preview,
        hasAttachment: msg.hasAttachment || false,
        isUnread: !msg.keywords?.$seen,
        isFlagged: msg.keywords?.$flagged || false,
      },
      body: {
        textBody: msg.textBody,
        htmlBody: msg.htmlBody,
        attachments: msg.attachments?.map((att: any) => ({
          blobId: att.blobId,
          type: att.type,
          name: att.name,
          size: att.size,
        })),
      },
    };
  }

  /**
   * 메시지 전송
   */
  async sendMessage(message: {
    from: { email: string; name?: string };
    to: Array<{ email: string; name?: string }>;
    cc?: Array<{ email: string; name?: string }>;
    bcc?: Array<{ email: string; name?: string }>;
    subject: string;
    textBody?: string;
    htmlBody?: string;
    attachments?: Array<{
      blobId: string;
      type: string;
      name: string;
    }>;
  }): Promise<string> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const apiUrl = this.apiUrlFromSession || this.apiUrl;
    const auth = Buffer.from(
      `${this.config.username}:${this.config.password}`
    ).toString("base64");

    const response = await fetch(`${apiUrl}/jmap`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        using: [
          "urn:ietf:params:jmap:core",
          "urn:ietf:params:jmap:mail",
        ],
        methodCalls: [
          [
            "Email/send",
            {
              accountId: this.config.username,
              create: {
                k1: {
                  from: [
                    {
                      email: message.from.email,
                      name: message.from.name,
                    },
                  ],
                  to: message.to.map((addr) => ({
                    email: addr.email,
                    name: addr.name,
                  })),
                  cc: message.cc?.map((addr) => ({
                    email: addr.email,
                    name: addr.name,
                  })),
                  bcc: message.bcc?.map((addr) => ({
                    email: addr.email,
                    name: addr.name,
                  })),
                  subject: message.subject,
                  textBody: message.textBody,
                  htmlBody: message.htmlBody,
                  attachments: message.attachments,
                },
              },
            },
            "0",
          ],
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`JMAP sendMessage failed: ${response.statusText}`);
    }

    const data = await response.json();
    const sentMessageId = data.methodResponses?.[0]?.[1]?.created?.k1?.id;

    return sentMessageId || "";
  }
}
