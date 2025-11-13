"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Mail,
  Inbox,
  Send,
  FileText,
  Trash2,
  Plus,
  Search,
  MoreVertical,
  Star,
  Archive,
  FolderPlus,
  Paperclip,
} from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface MailFolder {
  id: string
  name: string
  type: string
  unreadCount?: number
}

interface MailMessage {
  id: string
  subject: string
  from: string
  fromName?: string
  date: string
  isRead: boolean
  isStarred: boolean
  hasAttachment?: boolean
}

interface MailListClientProps {
  settings: { title: string }
  user: { email?: string | null }
}

export default function MailListClient({ settings, user }: MailListClientProps) {
  const router = useRouter()
  const [folders, setFolders] = useState<MailFolder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>("inbox")
  const [messages, setMessages] = useState<MailMessage[]>([])
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFolders()
    loadMessages()
  }, [selectedFolder])

  const loadFolders = async () => {
    try {
      const response = await fetch("/api/mail/folders")
      if (response.ok) {
        const data = await response.json()
        setFolders(data)
      }
    } catch (error) {
      console.error("폴더 로드 실패:", error)
    }
  }

  const loadMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/mail/messages?folder=${selectedFolder}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("메일 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedMessages(new Set(messages.map((m) => m.id)))
    } else {
      setSelectedMessages(new Set())
    }
  }

  const handleSelectMessage = (messageId: string, checked: boolean) => {
    const newSelected = new Set(selectedMessages)
    if (checked) {
      newSelected.add(messageId)
    } else {
      newSelected.delete(messageId)
      setSelectAll(false)
    }
    setSelectedMessages(newSelected)
  }

  const handleMarkAsRead = async (read: boolean) => {
    if (selectedMessages.size === 0) return

    try {
      const response = await fetch("/api/mail/messages/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageIds: Array.from(selectedMessages),
          isRead: read,
        }),
      })

      if (response.ok) {
        loadMessages()
        setSelectedMessages(new Set())
        setSelectAll(false)
      }
    } catch (error) {
      console.error("읽음 상태 변경 실패:", error)
    }
  }

  const handleMoveToFolder = async (folderId: string) => {
    if (selectedMessages.size === 0) return

    try {
      const response = await fetch("/api/mail/messages/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageIds: Array.from(selectedMessages),
          folderId,
        }),
      })

      if (response.ok) {
        loadMessages()
        setSelectedMessages(new Set())
        setSelectAll(false)
      }
    } catch (error) {
      console.error("메일 이동 실패:", error)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const response = await fetch("/api/mail/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName }),
      })

      if (response.ok) {
        loadFolders()
        setShowCreateFolderDialog(false)
        setNewFolderName("")
      }
    } catch (error) {
      console.error("폴더 생성 실패:", error)
    }
  }

  const defaultFolders = [
    { id: "inbox", name: "받은편지함", type: "inbox", icon: Inbox },
    { id: "sent", name: "보낸편지함", type: "sent", icon: Send },
    { id: "drafts", name: "임시보관함", type: "drafts", icon: FileText },
    { id: "trash", name: "휴지통", type: "trash", icon: Trash2 },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* 사이드바 */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">{settings.title}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <nav className="flex-1 overflow-auto p-4 space-y-1">
          {/* 기본 폴더 */}
          {defaultFolders.map((folder) => {
            const Icon = folder.icon
            return (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedFolder === folder.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{folder.name}</span>
              </button>
            )
          })}

          {/* 사용자 생성 폴더 */}
          {folders
            .filter((f) => f.type === "custom")
            .map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedFolder === folder.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Mail className="w-4 h-4" />
                <span className="flex-1">{folder.name}</span>
                {folder.unreadCount && folder.unreadCount > 0 && (
                  <span className="text-xs bg-primary/20 px-2 py-0.5 rounded">
                    {folder.unreadCount}
                  </span>
                )}
              </button>
            ))}

          {/* 폴더 생성 버튼 */}
          <button
            onClick={() => setShowCreateFolderDialog(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-accent text-muted-foreground"
          >
            <FolderPlus className="w-4 h-4" />
            <span>메일함 만들기</span>
          </button>
        </nav>

        <div className="p-4 border-t space-y-1">
          <a
            href="/settings"
            className="block px-3 py-2 rounded-lg hover:bg-accent text-sm"
          >
            설정
          </a>
          <a
            href="/api/auth/signout"
            className="block px-3 py-2 rounded-lg hover:bg-accent text-sm text-destructive"
          >
            로그아웃
          </a>
        </div>
      </aside>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {defaultFolders.find((f) => f.id === selectedFolder)?.name ||
                folders.find((f) => f.id === selectedFolder)?.name ||
                "메일"}
            </h2>
            <Button onClick={() => router.push("/mail/compose")}>
              메일 쓰기
            </Button>
          </div>

          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="메일 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 액션 버튼 */}
          {selectedMessages.size > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAsRead(true)}
              >
                모두 읽음
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAsRead(false)}
              >
                모두 안읽음
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // 특정 메일함으로 이동 다이얼로그 표시
                  const allFolders = [...defaultFolders, ...folders.filter((f) => f.type === "custom")]
                  const folderNames = allFolders.map((f) => f.name).join("\n")
                  const folderIndex = prompt(
                    `이동할 메일함을 선택하세요:\n\n${allFolders.map((f, i) => `${i + 1}. ${f.name}`).join("\n")}\n\n번호를 입력하세요:`
                  )
                  if (folderIndex) {
                    const index = parseInt(folderIndex) - 1
                    if (index >= 0 && index < allFolders.length) {
                      handleMoveToFolder(allFolders[index].id)
                    }
                  }
                }}
              >
                특정 메일함으로 이동
              </Button>
            </div>
          )}
        </header>

        {/* 메일 목록 */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              로딩 중...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              메일이 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {/* 전체 선택 */}
              <div className="p-4 border-b bg-muted/50 flex items-center gap-3">
                <Checkbox
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedMessages.size > 0
                    ? `${selectedMessages.size}개 선택됨`
                    : "전체 선택"}
                </span>
              </div>

              {/* 메일 목록 */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 hover:bg-accent cursor-pointer flex items-start gap-3 ${
                    !message.isRead ? "bg-primary/5 font-semibold" : ""
                  }`}
                  onClick={() => router.push(`/mail/view/${message.id}`)}
                >
                  <Checkbox
                    checked={selectedMessages.has(message.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleSelectMessage(message.id, e.target.checked)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">
                        {message.fromName || message.from}
                      </span>
                      {message.isStarred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {message.hasAttachment && (
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-sm truncate">{message.subject || "(제목 없음)"}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(message.date), "yyyy년 M월 d일 HH:mm", {
                        locale: ko,
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 폴더 생성 다이얼로그 */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>메일함 만들기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">메일함 이름</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="메일함 이름을 입력하세요"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFolder()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateFolderDialog(false)}
              >
                취소
              </Button>
              <Button onClick={handleCreateFolder}>만들기</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

