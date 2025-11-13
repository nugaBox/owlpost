import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

// 서명 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 })
    }

    const body = await request.json()
    const { name, content, isDefault } = body

    // 서명 확인
    const signature = await prisma.signature.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!signature) {
      return NextResponse.json(
        { error: "서명을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 기본 서명으로 설정하는 경우, 기존 기본 서명 해제
    if (isDefault) {
      await prisma.signature.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          id: { not: params.id },
        },
        data: {
          isDefault: false,
        },
      })
    }

    const updated = await prisma.signature.update({
      where: {
        id: params.id,
      },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        content: content !== undefined ? content.trim() : undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("서명 수정 실패:", error)
    return NextResponse.json(
      { error: "서명 수정 실패" },
      { status: 500 }
    )
  }
}

// 서명 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 })
    }

    // 서명 확인
    const signature = await prisma.signature.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!signature) {
      return NextResponse.json(
        { error: "서명을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    await prisma.signature.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("서명 삭제 실패:", error)
    return NextResponse.json(
      { error: "서명 삭제 실패" },
      { status: 500 }
    )
  }
}

