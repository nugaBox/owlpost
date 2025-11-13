// OwlPost - 관리자 계정 생성 스크립트

import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";

/**
 * 관리자 계정 생성
 */
export async function createAdminUser(
  email: string,
  password: string,
  name?: string
) {
  // 이미 존재하는 사용자 확인
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error(`이미 존재하는 사용자입니다: ${email}`);
  }

  // 비밀번호 해싱
  const passwordHash = await hashPassword(password);

  // 사용자 생성
  const user = await prisma.user.create({
    data: {
      email,
      name: name || "관리자",
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

  console.log(`✅ 관리자 계정이 생성되었습니다: ${email}`);
  return user;
}

// 스크립트로 직접 실행할 때
if (require.main === module) {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4];

  if (!email || !password) {
    console.error("사용법: npm run create-admin <email> <password> [name]");
    process.exit(1);
  }

  createAdminUser(email, password, name)
    .then(() => {
      console.log("관리자 계정 생성 완료!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("오류:", error.message);
      process.exit(1);
    });
}

