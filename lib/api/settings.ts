// OwlPost - 애플리케이션 설정 API

import { prisma } from "@/lib/db/prisma";

export interface AppSettingsData {
  title: string;
  description: string;
  icon?: string;
  favicon?: string;
  logo?: string;
}

const DEFAULT_SETTINGS: AppSettingsData = {
  title: "OwlPost",
  description: "직관적인 웹메일 클라이언트",
};

/**
 * 애플리케이션 설정 가져오기
 */
export async function getAppSettings(): Promise<AppSettingsData> {
  // 빌드 시에는 데이터베이스 연결이 없으므로 기본값 반환
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    return DEFAULT_SETTINGS;
  }

  try {
    const settings = await prisma.appSettings.findFirst();

    if (!settings) {
      // 기본 설정이 없으면 생성
      return await createDefaultSettings();
    }

    return {
      title: settings.title,
      description: settings.description,
      icon: settings.icon || undefined,
      favicon: settings.favicon || undefined,
      logo: settings.logo || undefined,
    };
  } catch (error) {
    // 데이터베이스 연결 실패 시 기본값 반환
    console.warn("Failed to fetch app settings, using defaults:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * 기본 설정 생성
 */
async function createDefaultSettings(): Promise<AppSettingsData> {
  const settings = await prisma.appSettings.create({
    data: DEFAULT_SETTINGS,
  });

  return {
    title: settings.title,
    description: settings.description,
    icon: settings.icon || undefined,
    favicon: settings.favicon || undefined,
    logo: settings.logo || undefined,
  };
}

/**
 * 애플리케이션 설정 업데이트
 */
export async function updateAppSettings(
  data: Partial<AppSettingsData>
): Promise<AppSettingsData> {
  let settings = await prisma.appSettings.findFirst();

  if (!settings) {
    settings = await prisma.appSettings.create({
      data: {
        title: data.title || DEFAULT_SETTINGS.title,
        description: data.description || DEFAULT_SETTINGS.description,
        icon: data.icon,
        favicon: data.favicon,
        logo: data.logo,
      },
    });
  } else {
    settings = await prisma.appSettings.update({
      where: { id: settings.id },
      data: {
        title: data.title,
        description: data.description,
        icon: data.icon,
        favicon: data.favicon,
        logo: data.logo,
      },
    });
  }

  return {
    title: settings.title,
    description: settings.description,
    icon: settings.icon || undefined,
    favicon: settings.favicon || undefined,
    logo: settings.logo || undefined,
  };
}

