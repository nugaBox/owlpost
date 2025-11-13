// OwlPost - 로그인 페이지

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [loginType, setLoginType] = useState<"sso" | "password">("sso");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const oauthEnabled = process.env.NEXT_PUBLIC_OAUTH_ENABLED === "true";
  const oauthProvider = process.env.NEXT_PUBLIC_OAUTH_PROVIDER || "SSO";

  const handleSSOLogin = () => {
    // OAuth SSO 로그인 처리
    window.location.href = "/api/auth/signin";
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL 파라미터에서 에러 확인
  useEffect(() => {
    if (errorParam) {
      if (errorParam === "undefined" || errorParam === "CredentialsSignin") {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError("로그인에 실패했습니다.");
      }
    }
  }, [errorParam]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // NextAuth v5의 signIn 함수 사용
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/", // 성공 시 리다이렉트할 URL
      });

      console.log("SignIn result:", result);

      // NextAuth v5 beta의 응답 형식 확인
      if (result?.error) {
        console.error("SignIn error:", result.error);
        const errorMessage = 
          result.error === "CredentialsSignin" || result.error === "undefined"
            ? "이메일 또는 비밀번호가 올바르지 않습니다."
            : result.error;
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // NextAuth v5 beta의 응답 처리
      // error가 없으면 성공으로 간주
      if (!result?.error) {
        console.log("Login successful, redirecting...");
        // 세션이 저장될 시간을 주기 위해 약간의 지연
        await new Promise((resolve) => setTimeout(resolve, 300));
        // 메일 화면으로 리다이렉트
        window.location.href = "/mail";
      } else {
        console.error("Unexpected signIn result:", result);
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("SignIn exception:", err);
      setError("서버 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            OwlPost 로그인
          </CardTitle>
          <CardDescription className="text-center">
            사내 웹메일 클라이언트에 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 로그인 방식 선택 */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={loginType === "sso" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setLoginType("sso")}
            >
              SSO 로그인
            </Button>
            <Button
              type="button"
              variant={loginType === "password" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setLoginType("password")}
            >
              아이디/비밀번호
            </Button>
          </div>

          {/* SSO 로그인 */}
          {loginType === "sso" && (
            <div className="space-y-4">
              {oauthEnabled ? (
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSSOLogin}
                >
                  {oauthProvider}로 로그인
                </Button>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  SSO가 설정되지 않았습니다.
                </div>
              )}
            </div>
          )}

          {/* 일반 로그인 */}
          {loginType === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:underline">
              홈으로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">로딩 중...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

