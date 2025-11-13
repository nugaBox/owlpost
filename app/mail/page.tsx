// OwlPost - 메일 화면

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getAppSettings } from "@/lib/api/settings";

export default async function MailPage() {
  const session = await auth();
  const settings = await getAppSettings();

  // 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-background">
      {/* 사이드바 */}
      <aside className="w-64 border-r bg-card">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">{settings.title}</h1>
          <p className="text-sm text-muted-foreground">
            {session.user?.email}
          </p>
        </div>
        <nav className="p-4 space-y-2">
          <a
            href="/mail"
            className="block px-3 py-2 rounded-lg bg-primary text-primary-foreground"
          >
            받은편지함
          </a>
          <a
            href="/mail/sent"
            className="block px-3 py-2 rounded-lg hover:bg-accent"
          >
            보낸편지함
          </a>
          <a
            href="/mail/drafts"
            className="block px-3 py-2 rounded-lg hover:bg-accent"
          >
            임시보관함
          </a>
          <a
            href="/mail/trash"
            className="block px-3 py-2 rounded-lg hover:bg-accent"
          >
            휴지통
          </a>
        </nav>
        <div className="p-4 border-t mt-auto">
          <a
            href="/settings"
            className="block px-3 py-2 rounded-lg hover:bg-accent text-sm"
          >
            설정
          </a>
          <a
            href="/api/auth/signout"
            className="block px-3 py-2 rounded-lg hover:bg-accent text-sm text-destructive"
          >
            로그아웃
          </a>
        </div>
      </aside>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">받은편지함</h2>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              메일 쓰기
            </button>
          </div>
        </header>

        {/* 메일 목록 */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <div className="text-center text-muted-foreground py-12">
              <p className="text-lg mb-2">메일 계정을 추가해주세요</p>
              <p className="text-sm">
                메일 계정을 설정하면 메일을 받아볼 수 있습니다.
              </p>
              <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                메일 계정 추가
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

