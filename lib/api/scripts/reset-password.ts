// OwlPost - 비밀번호 재설정 스크립트

import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";

/**
 * 사용자 비밀번호 재설정
 */
export async function resetUserPassword(
  email: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error(`사용자를 찾을 수 없습니다: ${email}`);
  }

  // 비밀번호 해싱
  const passwordHash = await hashPassword(newPassword);

  // 비밀번호 업데이트
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  console.log(`✅ 비밀번호가 재설정되었습니다: ${email}`);
  return user;
}

// 스크립트로 직접 실행할 때
if (require.main === module) {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("사용법: npm run reset-password <email> <new-password>");
    process.exit(1);
  }

  resetUserPassword(email, password)
    .then(() => {
      console.log("비밀번호 재설정 완료!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("오류:", error.message);
      process.exit(1);
    });
}

