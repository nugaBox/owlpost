// OwlPost - 환경 설정

export const config = {
  app: {
    name: process.env.APP_NAME || "owlpost",
    version: process.env.APP_VERSION || "0.0.1",
    url: process.env.APP_URL || "http://localhost:3000",
  },
  env: {
    mode: (process.env.NODE_ENV === "production" ? "production" : "development") as "production" | "development",
    logLevel:
      process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === "production" ? "warn" : "debug"),
  },
  database: {
    url: process.env.DATABASE_URL || "",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    enabled: process.env.REDIS_ENABLED === "true",
  },
  auth: {
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    secret: process.env.NEXTAUTH_SECRET || "",
  },
  oauth: {
    enabled: process.env.OAUTH_ENABLED === "true",
    provider: process.env.OAUTH_PROVIDER || "",
    clientId: process.env.OAUTH_CLIENT_ID || "",
    clientSecret: process.env.OAUTH_CLIENT_SECRET || "",
    authorizationUrl: process.env.OAUTH_AUTHORIZATION_URL || "",
    tokenUrl: process.env.OAUTH_TOKEN_URL || "",
    userInfoUrl: process.env.OAUTH_USERINFO_URL || "",
  },
  stalwart: {
    imap: {
      host: process.env.STALWART_IMAP_HOST || "localhost",
      port: parseInt(process.env.STALWART_IMAP_PORT || "143", 10),
      secure: process.env.STALWART_IMAP_SECURE === "true",
    },
    smtp: {
      host: process.env.STALWART_SMTP_HOST || "localhost",
      port: parseInt(process.env.STALWART_SMTP_PORT || "25", 10),
      secure: process.env.STALWART_SMTP_SECURE === "true",
    },
    jmap: {
      url: process.env.STALWART_JMAP_URL || "http://localhost:8080/jmap",
    },
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000", 10),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "",
    secretKey: process.env.MINIO_SECRET_KEY || "",
    bucketName: process.env.MINIO_BUCKET_NAME || "owlpost-attachments",
  },
  timezone: process.env.TZ || "Asia/Seoul",
} as const;

