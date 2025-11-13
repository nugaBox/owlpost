import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

// 메일 이동
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 })
    }

    const body = await request.json()
    const { messageIds, folderId } = body

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: "메일 ID 배열이 필요합니다" },
        { status: 400 }
      )
    }

    if (!folderId) {
      return NextResponse.json(
        { error: "폴더 ID가 필요합니다" },
        { status: 400 }
      )
    }

    // 폴더 확인
    const folder = await prisma.mailFolder.findFirst({
      where: {
        id: folderId,
        userId: session.user.id,
      },
    })

    if (!folder) {
      return NextResponse.json(
        { error: "폴더를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    await prisma.mailMessage.updateMany({
      where: {
        id: { in: messageIds },
        userId: session.user.id,
      },
      data: {
        folderId: folder.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("메일 이동 실패:", error)
    return NextResponse.json(
      { error: "메일 이동 실패" },
      { status: 500 }
    )
  }
}

