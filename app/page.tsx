// OwlPost - 메인 페이지

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { getAppSettings } from "@/lib/api/settings";
import { config } from "@/lib/config";

export default async function HomePage() {
  const session = await auth();
  const settings = await getAppSettings();

  // 로그인되어 있으면 메일 화면으로 리다이렉트
  if (session) {
    redirect("/mail");
  }

  // 로그인 전 홈 화면
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          {settings.logo && (
            <img
              src={settings.logo}
              alt={settings.title}
              className="h-16 w-16 mb-4"
            />
          )}
          <h1 className="text-5xl font-bold tracking-tight">
            {settings.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {settings.description}
          </p>
          <p className="text-sm text-muted-foreground">
            v{config.app.version}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
          >
            로그인
          </Link>
          <Link
            href="/releases"
            className="flex h-12 w-full items-center justify-center rounded-lg border border-border bg-background px-6 transition-colors hover:bg-accent sm:w-auto"
          >
            릴리즈 노트
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-center">
            <h3 className="font-semibold mb-2">IMAP/SMTP</h3>
            <p className="text-sm text-muted-foreground">
              표준 메일 프로토콜 지원
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center">
            <h3 className="font-semibold mb-2">JMAP</h3>
            <p className="text-sm text-muted-foreground">
              최신 메일 프로토콜 지원
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center">
            <h3 className="font-semibold mb-2">Stalwart 연동</h3>
            <p className="text-sm text-muted-foreground">
              Stalwart Mail 서버 연동
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
