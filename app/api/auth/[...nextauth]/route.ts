// OwlPost - NextAuth API 라우트

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/config";

export const { handlers, signIn, signOut } = NextAuth(authOptions);

export const { GET, POST } = handlers;
