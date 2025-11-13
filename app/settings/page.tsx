// OwlPost - 설정 페이지

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AppSettings {
  title: string;
  description: string;
  icon?: string;
  favicon?: string;
  logo?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    title: "OwlPost",
    description: "직관적인 웹메일 클라이언트",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
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
      <div className="max-w-2xl mx-auto">
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
      </div>
    </div>
  );
}

