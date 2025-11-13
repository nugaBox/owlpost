# 개발 가이드

## 코드 변경사항 적용

### 자동 반영 (재시작 불필요)

다음 변경사항은 **자동으로 반영**됩니다 (Next.js Hot Reload):

- ✅ React 컴포넌트 수정
- ✅ 페이지 파일 수정
- ✅ API 라우트 수정
- ✅ TypeScript 파일 수정
- ✅ CSS/스타일 파일 수정

**작업 방법**: 파일을 저장하면 자동으로 반영됩니다.

### 재시작이 필요한 경우

다음 변경사항은 **컨테이너 재시작**이 필요합니다:

- 🔄 `.env` 파일 변경 (환경 변수)
- 🔄 `package.json` 변경 (의존성 추가/제거)
- 🔄 `docker-compose.yml` 변경
- 🔄 `next.config.ts` 변경
- 🔄 Prisma 스키마 변경 후 마이그레이션

**작업 방법**:
```bash
# webapp만 재시작 (빠름)
docker-compose restart webapp

# 또는 전체 재시작
docker-compose down
docker-compose up -d
```

## 효율적인 개발 워크플로우

### 1. 일반적인 코드 수정
```bash
# 파일 수정 → 저장 → 자동 반영 (아무것도 안 해도 됨)
```

### 2. 새로운 패키지 설치
```bash
# 로컬에서 설치
npm install <package-name>

# 컨테이너에서도 설치 (또는 재시작)
docker-compose exec webapp npm install
docker-compose restart webapp
```

### 3. 환경 변수 변경
```bash
# .env 파일 수정 후
docker-compose restart webapp
```

### 4. 데이터베이스 스키마 변경
```bash
# Prisma 스키마 수정 후
docker-compose exec webapp npx prisma db push
# 또는
docker-compose exec webapp npm run db:migrate
```

## 로그 확인

```bash
# 실시간 로그 확인
docker-compose logs -f webapp

# 특정 서비스 로그
docker-compose logs -f postgres
docker-compose logs -f redis
```

## 빠른 재시작 스크립트

```bash
# webapp만 재시작 (가장 빠름)
docker-compose restart webapp

# 전체 재시작 (느림, 필요할 때만)
docker-compose down && docker-compose up -d
```

## 팁

1. **대부분의 경우 재시작 불필요**: 코드 변경은 자동 반영됩니다.
2. **환경 변수나 의존성 변경 시에만 재시작**: `docker-compose restart webapp`으로 충분합니다.
3. **전체 재시작은 최후의 수단**: `down && up`은 시간이 오래 걸리므로 필요한 경우에만 사용하세요.

