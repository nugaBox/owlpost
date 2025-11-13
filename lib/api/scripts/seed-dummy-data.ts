// OwlPost - 더미 데이터 생성 스크립트

import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";

/**
 * 더미 데이터 생성
 */
export async function seedDummyData() {
  console.log("🌱 더미 데이터 생성을 시작합니다...\n");

  // 1. 테스트 사용자 계정 생성
  const testUsers = [
    { email: "test1@comin.com", name: "테스트 사용자 1", password: "test1234" },
    { email: "test2@comin.com", name: "테스트 사용자 2", password: "test1234" },
    { email: "test3@comin.com", name: "테스트 사용자 3", password: "test1234" },
    { email: "manager@comin.com", name: "매니저", password: "test1234" },
    { email: "developer@comin.com", name: "개발자", password: "test1234" },
  ];

  const createdUsers = [];

  for (const userData of testUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`ℹ️  이미 존재하는 사용자: ${userData.email}`);
      createdUsers.push(existingUser);
      continue;
    }

    const passwordHash = await hashPassword(userData.password);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash,
        emailVerified: new Date(),
      },
    });

    // 사용자 설정 생성
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        language: "ko",
        timezone: "Asia/Seoul",
        theme: "light",
      },
    });

    createdUsers.push(user);
    console.log(`✅ 사용자 생성: ${userData.email} (${userData.name})`);
  }

  console.log(`\n📧 메일 계정 및 메일 데이터 생성 중...\n`);

  // 2. 각 사용자에 대한 메일 계정 및 더미 메일 생성
  for (const user of createdUsers) {
    // 메일 계정 생성 (이미 존재하면 가져오기)
    let mailAccount = await prisma.mailAccount.findFirst({
      where: {
        userId: user.id,
        email: user.email,
      },
    });

    if (!mailAccount) {
      mailAccount = await prisma.mailAccount.create({
        data: {
          userId: user.id,
          name: user.name || user.email,
          email: user.email,
          protocol: "imap",
          imapHost: process.env.STALWART_IMAP_HOST || "stalwart-mail",
          imapPort: parseInt(process.env.STALWART_IMAP_PORT || "143", 10),
          imapSecure: process.env.STALWART_IMAP_SECURE === "true",
          smtpHost: process.env.STALWART_SMTP_HOST || "stalwart-mail",
          smtpPort: parseInt(process.env.STALWART_SMTP_PORT || "25", 10),
          smtpSecure: process.env.STALWART_SMTP_SECURE === "true",
          username: user.email,
          password: "dummy-password", // 실제 비밀번호는 사용자가 설정해야 함
          isActive: true,
          isDefault: true,
        },
      });
    }

    // 기본 폴더 생성
    const folders = [
      { name: "받은편지함", type: "inbox" },
      { name: "보낸편지함", type: "sent" },
      { name: "임시보관함", type: "drafts" },
      { name: "휴지통", type: "trash" },
    ];

    const createdFolders = [];
    for (const folderData of folders) {
      let folder = await prisma.mailFolder.findFirst({
        where: {
          userId: user.id,
          accountId: mailAccount.id,
          name: folderData.name,
        },
      });

      if (!folder) {
        folder = await prisma.mailFolder.create({
          data: {
            userId: user.id,
            accountId: mailAccount.id,
            name: folderData.name,
            type: folderData.type,
            order: folders.indexOf(folderData),
          },
        });
      }
      createdFolders.push(folder);
    }

    const inboxFolder = createdFolders.find((f) => f.type === "inbox")!;
    const sentFolder = createdFolders.find((f) => f.type === "sent")!;
    const draftsFolder = createdFolders.find((f) => f.type === "drafts")!;

    // 받은 메일 생성 (다른 사용자들로부터)
    const receivedMessages = [
      {
        subject: "프로젝트 진행 상황 공유",
        from: "manager@comin.com",
        fromName: "매니저",
        to: [user.email],
        textBody: `${user.name}님, 안녕하세요.\n\n이번 주 프로젝트 진행 상황을 공유드립니다.\n\n감사합니다.`,
        htmlBody: `<p>${user.name}님, 안녕하세요.</p><p>이번 주 프로젝트 진행 상황을 공유드립니다.</p><p>감사합니다.</p>`,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
        isRead: true,
      },
      {
        subject: "회의 안내",
        from: "test1@comin.com",
        fromName: "테스트 사용자 1",
        to: [user.email],
        textBody: `회의 일정을 안내드립니다.\n\n일시: 내일 오후 2시\n장소: 회의실 A`,
        htmlBody: `<p>회의 일정을 안내드립니다.</p><p><strong>일시:</strong> 내일 오후 2시<br><strong>장소:</strong> 회의실 A</p>`,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
        isRead: false,
        isStarred: true,
      },
      {
        subject: "코드 리뷰 요청",
        from: "developer@comin.com",
        fromName: "개발자",
        to: [user.email],
        cc: ["manager@comin.com"],
        textBody: `코드 리뷰 부탁드립니다.\n\nPR: https://github.com/company/project/pull/123`,
        htmlBody: `<p>코드 리뷰 부탁드립니다.</p><p><a href="https://github.com/company/project/pull/123">PR 링크</a></p>`,
        date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12시간 전
        isRead: false,
      },
      {
        subject: "주간 리포트",
        from: "test2@comin.com",
        fromName: "테스트 사용자 2",
        to: [user.email],
        textBody: `이번 주 주간 리포트입니다.\n\n주요 내용:\n- 작업 A 완료\n- 작업 B 진행 중\n- 작업 C 계획`,
        htmlBody: `<p>이번 주 주간 리포트입니다.</p><ul><li>작업 A 완료</li><li>작업 B 진행 중</li><li>작업 C 계획</li></ul>`,
        date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6시간 전
        isRead: true,
      },
      {
        subject: "시스템 점검 안내",
        from: "admin@comin.com",
        fromName: "시스템 관리자",
        to: [user.email],
        textBody: `시스템 점검이 예정되어 있습니다.\n\n일시: 내일 새벽 2시 ~ 4시\n영향: 일시적인 서비스 중단 예상`,
        htmlBody: `<p>시스템 점검이 예정되어 있습니다.</p><p><strong>일시:</strong> 내일 새벽 2시 ~ 4시<br><strong>영향:</strong> 일시적인 서비스 중단 예상</p>`,
        date: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3시간 전
        isRead: false,
        isImportant: true,
      },
    ];

    for (const msgData of receivedMessages) {
      await prisma.mailMessage.create({
        data: {
          userId: user.id,
          accountId: mailAccount.id,
          folderId: inboxFolder.id,
          subject: msgData.subject,
          from: msgData.from,
          fromName: msgData.fromName,
          to: msgData.to,
          cc: msgData.cc || [],
          bcc: [],
          textBody: msgData.textBody,
          htmlBody: msgData.htmlBody,
          date: msgData.date,
          isRead: msgData.isRead || false,
          isStarred: msgData.isStarred || false,
          isImportant: msgData.isImportant || false,
          isDraft: false,
          isDeleted: false,
          flags: [],
        },
      });
    }

    // 보낸 메일 생성
    const sentMessages = [
      {
        subject: "프로젝트 제안서",
        to: ["manager@comin.com"],
        textBody: `안녕하세요.\n\n프로젝트 제안서를 첨부하여 보내드립니다.\n\n검토 부탁드립니다.`,
        htmlBody: `<p>안녕하세요.</p><p>프로젝트 제안서를 첨부하여 보내드립니다.</p><p>검토 부탁드립니다.</p>`,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
      },
      {
        subject: "회의록 공유",
        to: ["test1@comin.com", "test2@comin.com"],
        cc: ["manager@comin.com"],
        textBody: `오늘 회의록을 공유드립니다.\n\n주요 결정 사항:\n1. 기능 A 우선 개발\n2. 다음 회의: 금요일`,
        htmlBody: `<p>오늘 회의록을 공유드립니다.</p><p><strong>주요 결정 사항:</strong></p><ol><li>기능 A 우선 개발</li><li>다음 회의: 금요일</li></ol>`,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
      },
    ];

    for (const msgData of sentMessages) {
      await prisma.mailMessage.create({
        data: {
          userId: user.id,
          accountId: mailAccount.id,
          folderId: sentFolder.id,
          subject: msgData.subject,
          from: user.email,
          fromName: user.name || user.email,
          to: msgData.to,
          cc: msgData.cc || [],
          bcc: [],
          textBody: msgData.textBody,
          htmlBody: msgData.htmlBody,
          date: msgData.date,
          isRead: true,
          isDraft: false,
          isDeleted: false,
          flags: [],
        },
      });
    }

    // 임시보관함 메일 생성
    const draftMessages = [
      {
        subject: "월간 리포트 초안",
        to: ["manager@comin.com"],
        textBody: `이번 달 월간 리포트입니다.\n\n[작성 중...]`,
        htmlBody: `<p>이번 달 월간 리포트입니다.</p><p><em>[작성 중...]</em></p>`,
        date: new Date(),
      },
    ];

    for (const msgData of draftMessages) {
      await prisma.mailMessage.create({
        data: {
          userId: user.id,
          accountId: mailAccount.id,
          folderId: draftsFolder.id,
          subject: msgData.subject,
          from: user.email,
          fromName: user.name || user.email,
          to: msgData.to,
          cc: [],
          bcc: [],
          textBody: msgData.textBody,
          htmlBody: msgData.htmlBody,
          date: msgData.date,
          isRead: false,
          isDraft: true,
          isDeleted: false,
          flags: [],
        },
      });
    }

    console.log(`  ✅ ${user.email}: 받은 메일 ${receivedMessages.length}개, 보낸 메일 ${sentMessages.length}개, 임시보관함 ${draftMessages.length}개 생성`);
  }

  console.log(`\n✨ 더미 데이터 생성이 완료되었습니다!`);
  console.log(`\n📝 생성된 테스트 계정:`);
  testUsers.forEach((user) => {
    console.log(`   - ${user.email} / 비밀번호: ${user.password}`);
  });
}

// 스크립트로 직접 실행할 때
if (require.main === module) {
  seedDummyData()
    .then(() => {
      console.log("\n✅ 완료!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ 오류:", error.message);
      console.error(error);
      process.exit(1);
    });
}

