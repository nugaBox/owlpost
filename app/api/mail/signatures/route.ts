import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

// 서명 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 })
    }

    const signatures = await prisma.signature.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(signatures)
  } catch (error) {
    console.error("서명 조회 실패:", error)
    return NextResponse.json(
      { error: "서명 조회 실패" },
      { status: 500 }
    )
  }
}

// 서명 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 })
    }

    const body = await request.json()
    const { name, content, isDefault } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "서명 이름이 필요합니다" },
        { status: 400 }
      )
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "서명 내용이 필요합니다" },
        { status: 400 }
      )
    }

    // 기본 서명으로 설정하는 경우, 기존 기본 서명 해제
    if (isDefault) {
      await prisma.signature.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    const signature = await prisma.signature.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        content: content.trim(),
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json(signature)
  } catch (error) {
    console.error("서명 생성 실패:", error)
    return NextResponse.json(
      { error: "서명 생성 실패" },
      { status: 500 }
    )
  }
}

