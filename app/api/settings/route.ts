// OwlPost - 설정 API

import { NextRequest, NextResponse } from "next/server";
import { getAppSettings, updateAppSettings } from "@/lib/api/settings";

export async function GET() {
  try {
    const settings = await getAppSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "설정을 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = await updateAppSettings(body);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: "설정을 업데이트하는데 실패했습니다." },
      { status: 500 }
    );
  }
}

