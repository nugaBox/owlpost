import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { MailClientFactory } from "@/lib/mail"

// 메일 발송
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 })
    }

    const formData = await request.formData()
    const to = formData.get("to") as string
    const cc = formData.get("cc") as string
    const bcc = formData.get("bcc") as string
    const subject = formData.get("subject") as string
    const htmlBody = formData.get("htmlBody") as string
    const textBody = formData.get("textBody") as string
    const isDraft = formData.get("isDraft") === "true"
    const useSignature = formData.get("useSignature") === "true"
    const scheduledAt = formData.get("scheduledAt") as string | null
    const attachments = formData.getAll("attachments") as File[]

    if (!to && !isDraft) {
      return NextResponse.json(
        { error: "받는 사람이 필요합니다" },
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

    // 서명 추가
    let finalHtmlBody = htmlBody || ""
    if (useSignature && !isDraft) {
      const signature = await prisma.signature.findFirst({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
      })

      if (signature) {
        finalHtmlBody += `<br/><br/>${signature.content}`
      }
    }

    // 예약 발송인 경우
    if (scheduledAt && !isDraft) {
      const scheduledDate = new Date(scheduledAt)
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { error: "예약 시간은 현재 시간 이후여야 합니다" },
          { status: 400 }
        )
      }

      // 첨부파일 정보 저장
      const attachmentData = attachments.map((file) => ({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        // 실제로는 파일을 저장하고 경로를 저장해야 함
        path: "",
      }))

      const scheduledMail = await prisma.scheduledMail.create({
        data: {
          userId: session.user.id,
          accountId: defaultAccount.id,
          to: to ? to.split(",").map((e) => e.trim()) : [],
          cc: cc ? cc.split(",").map((e) => e.trim()) : [],
          bcc: bcc ? bcc.split(",").map((e) => e.trim()) : [],
          subject: subject || "",
          htmlBody: finalHtmlBody,
          textBody: textBody || "",
          scheduledAt: scheduledDate,
          attachments: attachmentData.length > 0 ? attachmentData : undefined,
        },
      })

      return NextResponse.json({
        success: true,
        scheduled: true,
        scheduledMailId: scheduledMail.id,
      })
    }

    // 임시 저장인 경우
    if (isDraft) {
      const draftsFolder = await prisma.mailFolder.findFirst({
        where: {
          userId: session.user.id,
          accountId: defaultAccount.id,
          type: "drafts",
        },
      })

      if (!draftsFolder) {
        // 임시보관함이 없으면 생성
        const newDraftsFolder = await prisma.mailFolder.create({
          data: {
            userId: session.user.id,
            accountId: defaultAccount.id,
            name: "임시보관함",
            type: "drafts",
          },
        })

        const draft = await prisma.mailMessage.create({
          data: {
            userId: session.user.id,
            accountId: defaultAccount.id,
            folderId: newDraftsFolder.id,
            from: defaultAccount.email,
            to: to ? to.split(",").map((e) => e.trim()) : [],
            cc: cc ? cc.split(",").map((e) => e.trim()) : [],
            bcc: bcc ? bcc.split(",").map((e) => e.trim()) : [],
            subject: subject || "",
            htmlBody: finalHtmlBody,
            textBody: textBody || "",
            date: new Date(),
            isDraft: true,
          },
        })

        return NextResponse.json({ success: true, draftId: draft.id })
      }

      const draft = await prisma.mailMessage.create({
        data: {
          userId: session.user.id,
          accountId: defaultAccount.id,
          folderId: draftsFolder.id,
          from: defaultAccount.email,
          to: to ? to.split(",").map((e) => e.trim()) : [],
          cc: cc ? cc.split(",").map((e) => e.trim()) : [],
          bcc: bcc ? bcc.split(",").map((e) => e.trim()) : [],
          subject: subject || "",
          htmlBody: finalHtmlBody,
          textBody: textBody || "",
          date: new Date(),
          isDraft: true,
        },
      })

      return NextResponse.json({ success: true, draftId: draft.id })
    }

    // 즉시 발송
    const smtpClient = await MailClientFactory.createSMTPFromAccount(
      defaultAccount.id
    )

    // TODO: 실제 SMTP 발송 구현
    // await smtpClient.send({
    //   to: to.split(",").map((e) => e.trim()),
    //   cc: cc ? cc.split(",").map((e) => e.trim()) : [],
    //   bcc: bcc ? bcc.split(",").map((e) => e.trim()) : [],
    //   subject: subject || "",
    //   html: finalHtmlBody,
    //   text: textBody || "",
    //   attachments: attachments,
    // })

    // 발송된 메일을 보낸편지함에 저장
    const sentFolder = await prisma.mailFolder.findFirst({
      where: {
        userId: session.user.id,
        accountId: defaultAccount.id,
        type: "sent",
      },
    })

    if (sentFolder) {
      await prisma.mailMessage.create({
        data: {
          userId: session.user.id,
          accountId: defaultAccount.id,
          folderId: sentFolder.id,
          from: defaultAccount.email,
          to: to.split(",").map((e) => e.trim()),
          cc: cc ? cc.split(",").map((e) => e.trim()) : [],
          bcc: bcc ? bcc.split(",").map((e) => e.trim()) : [],
          subject: subject || "",
          htmlBody: finalHtmlBody,
          textBody: textBody || "",
          date: new Date(),
          isRead: true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("메일 발송 실패:", error)
    return NextResponse.json(
      { error: "메일 발송 실패" },
      { status: 500 }
    )
  }
}

