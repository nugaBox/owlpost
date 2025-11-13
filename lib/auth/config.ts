// OwlPost - NextAuth 설정

import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { config } from "@/lib/config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// 커스텀 OAuth 프로바이더는 환경 변수에 따라 동적으로 추가

export const authOptions: NextAuthConfig = {
  // adapter는 JWT 전략 사용 시 필요 없을 수 있음
  // adapter: PrismaAdapter(prisma) as any,
  providers: [
    // 일반 로그인 (이메일/비밀번호)
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.log(`[Auth] User not found: ${credentials.email}`);
            return null;
          }

          if (!user.passwordHash) {
            console.log(`[Auth] User has no password hash: ${credentials.email}`);
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isValid) {
            console.log(`[Auth] Invalid password for: ${credentials.email}`);
            return null;
          }

          console.log(`[Auth] Login successful: ${credentials.email}`);
          // NextAuth v5 beta는 사용자 객체에 id가 필수
          const userData = {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            image: user.image || undefined,
          };
          console.log(`[Auth] Returning user data:`, userData);
          return userData;
        } catch (error) {
          console.error("[Auth] Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, credentials }) {
      console.log("[Auth] SignIn callback:", { user, account, credentials });
      // Credentials 로그인은 항상 허용
      return true;
    },
    async jwt({ token, user, account }) {
      console.log("[Auth] JWT callback:", { token, user, account });
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[Auth] Session callback:", { session, token });
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  secret: config.auth.secret,
  debug: config.env.mode === "development",
  trustHost: true,
} satisfies NextAuthConfig;
