// OwlPost - 통합 메일 클라이언트

import { IMAPClient, IMAPConfig } from "./imap";
import { SMTPClient, SMTPConfig } from "./smtp";
import { JMAPClient, JMAPConfig } from "./jmap";
import { prisma } from "@/lib/db/prisma";

export type MailProtocol = "imap" | "smtp" | "jmap";

export interface MailAccountConfig {
  id: string;
  userId: string;
  protocol: MailProtocol;
  imap?: IMAPConfig;
  smtp?: SMTPConfig;
  jmap?: JMAPConfig;
}

/**
 * 메일 계정에 따라 적절한 클라이언트를 반환하는 팩토리
 */
export class MailClientFactory {
  /**
   * 데이터베이스에서 메일 계정 정보를 가져와 클라이언트 생성
   */
  static async createFromAccount(accountId: string) {
    const account = await prisma.mailAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error("메일 계정을 찾을 수 없습니다.");
    }

    if (account.protocol === "imap" && account.imapHost) {
      return new IMAPClient({
        host: account.imapHost,
        port: account.imapPort || 143,
        secure: account.imapSecure,
        username: account.username,
        password: account.password, // 실제로는 복호화 필요
      });
    }

    if (account.protocol === "jmap" && account.jmapUrl) {
      return new JMAPClient({
        url: account.jmapUrl,
        username: account.username,
        password: account.password, // 실제로는 복호화 필요
      });
    }

    throw new Error("지원하지 않는 프로토콜입니다.");
  }

  /**
   * SMTP 클라이언트 생성
   */
  static async createSMTPFromAccount(accountId: string) {
    const account = await prisma.mailAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || !account.smtpHost) {
      throw new Error("SMTP 설정을 찾을 수 없습니다.");
    }

    return new SMTPClient({
      host: account.smtpHost,
      port: account.smtpPort || 25,
      secure: account.smtpSecure,
      username: account.username,
      password: account.password, // 실제로는 복호화 필요
    });
  }
}

export { IMAPClient, SMTPClient, JMAPClient };
export type { IMAPConfig, SMTPConfig, JMAPConfig };

