// OwlPost - 클라이언트용 설정 유틸리티

let cachedSettings: {
  title: string;
  description: string;
  icon?: string;
  favicon?: string;
  logo?: string;
} | null = null;

/**
 * 클라이언트에서 설정 가져오기 (캐시 사용)
 */
export async function getSettingsClient() {
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    const response = await fetch("/api/settings");
    if (response.ok) {
      cachedSettings = await response.json();
      return cachedSettings;
    }
  } catch (error) {
    console.error("Failed to fetch settings:", error);
  }

  // 기본값 반환
  return {
    title: "OwlPost",
    description: "직관적인 웹메일 클라이언트",
  };
}

/**
 * 설정 캐시 초기화
 */
export function clearSettingsCache() {
  cachedSettings = null;
}

