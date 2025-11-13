"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Paperclip, Clock, Send, Save } from "lucide-react"
import dynamic from "next/dynamic"

// CKEditor를 동적으로 로드 (SSR 방지)
const CKEditor = dynamic(
  () => import("@/components/editor/CKEditor"),
  { ssr: false }
)

export default function ComposePage() {
  const router = useRouter()
  const [to, setTo] = useState("")
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [subject, setSubject] = useState("")
  const [htmlContent, setHtmlContent] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [useSignature, setUseSignature] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files)
    setAttachments((prev) => [...prev, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append("to", to)
      formData.append("cc", cc)
      formData.append("bcc", bcc)
      formData.append("subject", subject)
      formData.append("htmlBody", htmlContent)
      formData.append("isDraft", "true")
      attachments.forEach((file) => {
        formData.append("attachments", file)
      })

      const response = await fetch("/api/mail/send", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        router.push("/mail")
      }
    } catch (error) {
      console.error("임시 저장 실패:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async (scheduledAt?: string) => {
    setIsSending(true)
    try {
      const formData = new FormData()
      formData.append("to", to)
      formData.append("cc", cc)
      formData.append("bcc", bcc)
      formData.append("subject", subject)
      formData.append("htmlBody", htmlContent)
      formData.append("useSignature", useSignature.toString())
      if (scheduledAt) {
        formData.append("scheduledAt", scheduledAt)
      }
      attachments.forEach((file) => {
        formData.append("attachments", file)
      })

      const response = await fetch("/api/mail/send", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        router.push("/mail")
      }
    } catch (error) {
      console.error("발송 실패:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleScheduleSend = () => {
    if (!scheduledDate || !scheduledTime) {
      alert("예약 날짜와 시간을 입력해주세요.")
      return
    }
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
    handleSend(scheduledAt)
    setShowScheduleDialog(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">메일 쓰기</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving || isSending}
            >
              <Save className="w-4 h-4 mr-2" />
              임시 저장
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowScheduleDialog(true)}
              disabled={isSaving || isSending}
            >
              <Clock className="w-4 h-4 mr-2" />
              예약 발송
            </Button>
            <Button
              onClick={() => handleSend()}
              disabled={isSaving || isSending}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "발송 중..." : "보내기"}
            </Button>
          </div>
        </header>

        {/* 메일 작성 영역 */}
        <div className="flex-1 overflow-auto p-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* 수신자 */}
              <div className="space-y-2">
                <Label htmlFor="to">받는 사람</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="받는 사람 이메일"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  multiple
                />
              </div>

              {/* 참조 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cc">참조</Label>
                  <button
                    type="button"
                    onClick={() => {
                      const ccInput = document.getElementById("cc")
                      if (ccInput) {
                        ccInput.style.display =
                          ccInput.style.display === "none" ? "block" : "none"
                      }
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    참조 추가
                  </button>
                </div>
                <Input
                  id="cc"
                  type="email"
                  placeholder="참조 이메일"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  multiple
                />
              </div>

              {/* 숨은 참조 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bcc">숨은 참조</Label>
                  <button
                    type="button"
                    onClick={() => {
                      const bccInput = document.getElementById("bcc")
                      if (bccInput) {
                        bccInput.style.display =
                          bccInput.style.display === "none" ? "block" : "none"
                      }
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    숨은 참조 추가
                  </button>
                </div>
                <Input
                  id="bcc"
                  type="email"
                  placeholder="숨은 참조 이메일"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  multiple
                />
              </div>

              {/* 제목 */}
              <div className="space-y-2">
                <Label htmlFor="subject">제목</Label>
                <Input
                  id="subject"
                  placeholder="제목"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* 서명 설정 */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="useSignature"
                  checked={useSignature}
                  onChange={(e) => setUseSignature(e.target.checked)}
                />
                <Label htmlFor="useSignature" className="cursor-pointer">
                  서명 사용
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSignatureDialog(true)}
                >
                  서명 설정
                </Button>
              </div>

              {/* 에디터 */}
              <div className="space-y-2">
                <Label>내용</Label>
                <div className="border rounded-md min-h-[400px]">
                  <CKEditor
                    data={htmlContent}
                    onChange={(data: string) => setHtmlContent(data)}
                  />
                </div>
              </div>

              {/* 첨부파일 */}
              <div className="space-y-2">
                <Label>첨부파일</Label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-md p-4 ${
                    isDragging ? "border-primary bg-primary/5" : "border-muted"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      파일 선택
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                    <span className="text-sm text-muted-foreground">
                      또는 파일을 여기에 드래그하세요
                    </span>
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 서명 설정 다이얼로그 */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>서명 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              서명 설정은 설정 페이지에서 관리할 수 있습니다.
            </p>
            <Button onClick={() => router.push("/settings")}>
              설정 페이지로 이동
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 예약 발송 다이얼로그 */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>예약 발송</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">날짜</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">시간</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
              >
                취소
              </Button>
              <Button onClick={handleScheduleSend}>예약 설정</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

