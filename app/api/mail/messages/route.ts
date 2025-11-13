import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

// 메일 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const folderId = searchParams.get("folder")
    const search = searchParams.get("search")

    if (!folderId) {
      return NextResponse.json(
        { error: "폴더 ID가 필요합니다" },
        { status: 400 }
      )
    }

    // 폴더 타입으로 찾기 (inbox, sent, drafts, trash)
    let folder
    if (["inbox", "sent", "drafts", "trash"].includes(folderId)) {
      folder = await prisma.mailFolder.findFirst({
        where: {
          userId: session.user.id,
          type: folderId,
        },
      })
    } else {
      folder = await prisma.mailFolder.findFirst({
        where: {
          id: folderId,
          userId: session.user.id,
        },
      })
    }

    if (!folder) {
      // 기본 폴더가 없으면 생성
      const defaultAccount = await prisma.mailAccount.findFirst({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
      })

      if (!defaultAccount) {
        return NextResponse.json({ error: "메일 계정이 없습니다" }, { status: 400 })
      }

      folder = await prisma.mailFolder.create({
        data: {
          userId: session.user.id,
          accountId: defaultAccount.id,
          name:
            folderId === "inbox"
              ? "받은편지함"
              : folderId === "sent"
              ? "보낸편지함"
              : folderId === "drafts"
              ? "임시보관함"
              : "휴지통",
          type: folderId,
        },
      })
    }

    const where: any = {
      userId: session.user.id,
      folderId: folder.id,
      isDeleted: folder.type === "trash" ? undefined : false,
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { from: { contains: search, mode: "insensitive" } },
        { fromName: { contains: search, mode: "insensitive" } },
        { textBody: { contains: search, mode: "insensitive" } },
      ]
    }

    const messages = await prisma.mailMessage.findMany({
      where,
      orderBy: { date: "desc" },
      take: 100,
      include: {
        _count: {
          select: {
            attachments: true,
          },
        },
      },
    })

    const messagesWithAttachment = messages.map((message) => ({
      id: message.id,
      subject: message.subject,
      from: message.from,
      fromName: message.fromName,
      date: message.date.toISOString(),
      isRead: message.isRead,
      isStarred: message.isStarred,
      hasAttachment: message._count.attachments > 0,
    }))

    return NextResponse.json(messagesWithAttachment)
  } catch (error) {
    console.error("메일 목록 조회 실패:", error)
    return NextResponse.json(
      { error: "메일 목록 조회 실패" },
      { status: 500 }
    )
  }
}

