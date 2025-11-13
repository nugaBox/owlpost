// OwlPost - 메일 화면

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"
import { getAppSettings } from "@/lib/api/settings"
import MailListClient from "@/components/mail/MailListClient"

export default async function MailPage() {
  const session = await auth()
  const settings = await getAppSettings()

  // 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
  if (!session) {
    redirect("/login")
  }

  return <MailListClient settings={settings} user={session.user} />
}
