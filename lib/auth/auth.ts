// OwlPost - NextAuth auth 함수 export

import NextAuth from "next-auth";
import { authOptions } from "./config";

export const { auth } = NextAuth(authOptions);
