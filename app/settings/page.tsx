// OwlPost - 설정 페이지

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";

interface AppSettings {
  title: string;
  description: string;
  icon?: string;
  favicon?: string;
  logo?: string;
}

interface Signature {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    title: "OwlPost",
    description: "직관적인 웹메일 클라이언트",
  });
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // 서명 관리 상태
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [editingSignature, setEditingSignature] = useState<Signature | null>(null);
  const [signatureName, setSignatureName] = useState("");
  const [signatureContent, setSignatureContent] = useState("");
  const [signatureIsDefault, setSignatureIsDefault] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSignatures();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSignatures = async () => {
    try {
      const response = await fetch("/api/mail/signatures");
      if (response.ok) {
        const data = await response.json();
        setSignatures(data);
      }
    } catch (error) {
      console.error("서명 로드 실패:", error);
    }
  };

  const handleOpenSignatureDialog = (signature?: Signature) => {
    if (signature) {
      setEditingSignature(signature);
      setSignatureName(signature.name);
      setSignatureContent(signature.content);
      setSignatureIsDefault(signature.isDefault);
    } else {
      setEditingSignature(null);
      setSignatureName("");
      setSignatureContent("");
      setSignatureIsDefault(false);
    }
    setShowSignatureDialog(true);
  };

  const handleSaveSignature = async () => {
    if (!signatureName.trim() || !signatureContent.trim()) {
      setMessage({ type: "error", text: "서명 이름과 내용을 입력해주세요." });
      return;
    }

    try {
      const url = editingSignature
        ? `/api/mail/signatures/${editingSignature.id}`
        : "/api/mail/signatures";
      const method = editingSignature ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signatureName.trim(),
          content: signatureContent.trim(),
          isDefault: signatureIsDefault,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "서명이 저장되었습니다." });
        setShowSignatureDialog(false);
        loadSignatures();
      } else {
        setMessage({ type: "error", text: "서명 저장에 실패했습니다." });
      }
    } catch (error) {
      console.error("서명 저장 실패:", error);
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    }
  };

  const handleDeleteSignature = async (id: string) => {
    if (!confirm("정말 이 서명을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/mail/signatures/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "서명이 삭제되었습니다." });
        loadSignatures();
      } else {
        setMessage({ type: "error", text: "서명 삭제에 실패했습니다." });
      }
    } catch (error) {
      console.error("서명 삭제 실패:", error);
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "설정이 저장되었습니다." });
        // 페이지 새로고침하여 변경사항 반영
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: "error", text: "설정 저장에 실패했습니다." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 애플리케이션 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>애플리케이션 설정</CardTitle>
            <CardDescription>
              애플리케이션의 제목, 설명, 아이콘 등을 설정할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {message && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={settings.title}
                  onChange={(e) =>
                    setSettings({ ...settings, title: e.target.value })
                  }
                  placeholder="OwlPost"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Input
                  id="description"
                  value={settings.description}
                  onChange={(e) =>
                    setSettings({ ...settings, description: e.target.value })
                  }
                  placeholder="직관적인 웹메일 클라이언트"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">아이콘 URL</Label>
                <Input
                  id="icon"
                  type="url"
                  value={settings.icon || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, icon: e.target.value || undefined })
                  }
                  placeholder="https://example.com/icon.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favicon">파비콘 URL</Label>
                <Input
                  id="favicon"
                  type="url"
                  value={settings.favicon || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, favicon: e.target.value || undefined })
                  }
                  placeholder="https://example.com/favicon.ico"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">로고 URL</Label>
                <Input
                  id="logo"
                  type="url"
                  value={settings.logo || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, logo: e.target.value || undefined })
                  }
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "저장 중..." : "저장"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = "/"}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 서명 관리 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>서명 관리</CardTitle>
                <CardDescription>
                  메일 발송 시 사용할 서명을 관리할 수 있습니다.
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenSignatureDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                서명 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {signatures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                서명이 없습니다. 서명을 추가해주세요.
              </div>
            ) : (
              <div className="space-y-4">
                {signatures.map((signature) => (
                  <div
                    key={signature.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{signature.name}</h3>
                        {signature.isDefault && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            기본
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenSignatureDialog(signature)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSignature(signature.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div
                      className="text-sm text-muted-foreground border-t pt-2"
                      dangerouslySetInnerHTML={{ __html: signature.content }}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 서명 편집 다이얼로그 */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSignature ? "서명 수정" : "서명 추가"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signatureName">서명 이름</Label>
              <Input
                id="signatureName"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="예: 회사 서명"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signatureContent">서명 내용 (HTML)</Label>
              <Textarea
                id="signatureContent"
                value={signatureContent}
                onChange={(e) => setSignatureContent(e.target.value)}
                placeholder="<p>이름</p><p>회사명</p><p>이메일</p>"
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                HTML 형식으로 입력하세요. 예: &lt;p&gt;이름&lt;/p&gt;
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="signatureIsDefault"
                checked={signatureIsDefault}
                onChange={(e) => setSignatureIsDefault(e.target.checked)}
              />
              <Label htmlFor="signatureIsDefault" className="cursor-pointer">
                기본 서명으로 설정
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSignatureDialog(false)}
            >
              취소
            </Button>
            <Button onClick={handleSaveSignature}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

