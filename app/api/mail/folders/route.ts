import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

// 폴더 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 })
    }

    const folders = await prisma.mailFolder.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" },
      ],
      include: {
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
              },
            },
          },
        },
      },
    })

    const foldersWithCount = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      type: folder.type,
      unreadCount: folder._count.messages,
    }))

    return NextResponse.json(foldersWithCount)
  } catch (error) {
    console.error("폴더 조회 실패:", error)
    return NextResponse.json(
      { error: "폴더 조회 실패" },
      { status: 500 }
    )
  }
}

// 폴더 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "폴더 이름이 필요합니다" },
        { status: 400 }
      )
    }

    // 기본 메일 계정 가져오기
    const defaultAccount = await prisma.mailAccount.findFirst({
      where: {
        userId: session.user.id,
        isDefault: true,
        isActive: true,
      },
    })

    if (!defaultAccount) {
      return NextResponse.json(
        { error: "활성 메일 계정이 없습니다" },
        { status: 400 }
      )
    }

    const folder = await prisma.mailFolder.create({
      data: {
        userId: session.user.id,
        accountId: defaultAccount.id,
        name: name.trim(),
        type: "custom",
      },
    })

    return NextResponse.json({
      id: folder.id,
      name: folder.name,
      type: folder.type,
    })
  } catch (error) {
    console.error("폴더 생성 실패:", error)
    return NextResponse.json(
      { error: "폴더 생성 실패" },
      { status: 500 }
    )
  }
}

