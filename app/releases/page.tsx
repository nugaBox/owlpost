// OwlPost - 릴리즈 노트 페이지

import { Metadata } from "next";

const APP_VERSION = "0.0.1";

export const metadata: Metadata = {
  title: "릴리즈 노트",
};

interface ReleaseNote {
  version: string;
  date: string;
  features: string[];
  improvements: string[];
  fixes: string[];
}

const releases: ReleaseNote[] = [
  {
    version: "0.0.1",
    date: "2024-01-01",
    features: [
      "프로젝트 초기 설정",
      "Next.js + Tailwind + shadcn/ui 기반 UI 구성",
      "PostgreSQL 데이터베이스 연동",
      "Redis 캐시/세션 저장소 지원",
      "MinIO 첨부파일 저장소 연동",
      "OAuth SSO 및 일반 로그인 지원",
      "IMAP/SMTP/JMAP 프로토콜 지원 준비",
      "Stalwart Mail 서버 연동 준비",
      "한국어 및 한국 시간대 기본 설정",
      "Docker Compose 기반 배포 환경",
    ],
    improvements: [],
    fixes: [],
  },
];

export default function ReleasesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">릴리즈 노트</h1>
            <p className="text-muted-foreground">
              OwlPost의 버전별 변경사항을 확인하세요.
            </p>
          </div>

          <div className="space-y-12">
            {releases.map((release) => (
              <div
                key={release.version}
                className="border rounded-lg p-6 bg-card shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">
                      v{release.version}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {new Date(release.date).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {release.version === APP_VERSION ? "현재 버전" : ""}
                  </span>
                </div>

                {release.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
                      새로운 기능
                    </h3>
                    <ul className="space-y-2">
                      {release.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2 text-green-600 dark:text-green-400">
                            ✨
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {release.improvements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
                      개선사항
                    </h3>
                    <ul className="space-y-2">
                      {release.improvements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2 text-blue-600 dark:text-blue-400">
                            ⚡
                          </span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {release.fixes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-orange-600 dark:text-orange-400">
                      버그 수정
                    </h3>
                    <ul className="space-y-2">
                      {release.fixes.map((fix, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2 text-orange-600 dark:text-orange-400">
                            🐛
                          </span>
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>OwlPost v{APP_VERSION}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

