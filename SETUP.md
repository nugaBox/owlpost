# OwlPost 설정 가이드

## 1. 데이터베이스 마이그레이션

먼저 데이터베이스 스키마를 생성해야 합니다.

### Docker Compose 사용 시
```bash
docker-compose exec webapp npx prisma db push
```

### 로컬 개발 시
```bash
npm run db:push
# 또는
npm run db:migrate
```

## 2. 관리자 계정 생성

관리자 계정을 생성하여 로그인할 수 있습니다.

### Docker Compose 사용 시
```bash
docker-compose exec webapp npm run create-admin <이메일> <비밀번호> [이름]
```

예시:
```bash
docker-compose exec webapp npm run create-admin admin@example.com admin123 관리자
```

### 로컬 개발 시
```bash
npm run create-admin <이메일> <비밀번호> [이름]
```

예시:
```bash
npm run create-admin admin@example.com admin123 관리자
```

## 3. 로그인

1. 웹 브라우저에서 http://localhost:3000 접속
2. "로그인" 버튼 클릭
3. "아이디/비밀번호" 탭 선택
4. 생성한 관리자 계정의 이메일과 비밀번호 입력
5. 로그인 완료

## 4. 애플리케이션 설정

로그인 후 `/settings` 페이지에서 다음을 설정할 수 있습니다:
- 제목 (기본값: "OwlPost")
- 설명 (기본값: "직관적인 웹메일 클라이언트")
- 아이콘 URL
- 파비콘 URL
- 로고 URL

## 5. SSO 연동 (나중에)

SSO 연동은 `.env` 파일에서 다음 설정을 추가하면 됩니다:
- `OAUTH_ENABLED=true`
- `OAUTH_PROVIDER=your-provider`
- `OAUTH_CLIENT_ID=your-client-id`
- `OAUTH_CLIENT_SECRET=your-client-secret`
- `OAUTH_AUTHORIZATION_URL=...`
- `OAUTH_TOKEN_URL=...`
- `OAUTH_USERINFO_URL=...`

## 문제 해결

### 관리자 계정 생성 오류
- 데이터베이스가 실행 중인지 확인: `docker-compose ps`
- 데이터베이스 마이그레이션이 완료되었는지 확인

### 로그인 실패
- 이메일과 비밀번호가 정확한지 확인
- 데이터베이스에 사용자가 생성되었는지 확인:
  ```bash
  docker-compose exec webapp npx prisma studio
  ```

