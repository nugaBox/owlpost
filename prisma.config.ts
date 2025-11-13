// dotenv는 선택적으로 로드 (프로덕션에서는 없을 수 있음)
try {
  require("dotenv/config");
} catch {
  // dotenv가 없으면 무시 (환경 변수는 이미 설정되어 있음)
}

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
