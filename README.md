# OwlPost - 사내 웹메일 클라이언트

OwlPost는 사내에서 사용할 수 있는 모던한 웹메일 클라이언트입니다. IMAP/SMTP/JMAP 프로토콜을 지원하며, Stalwart Mail 서버와 연동됩니다.

## 주요 기능

- ✅ **IMAP/SMTP/JMAP 지원**: 표준 메일 프로토콜 및 최신 JMAP 프로토콜 지원
- ✅ **Stalwart Mail 연동**: Stalwart Mail 서버와 완벽한 연동
- ✅ **OAuth SSO 로그인**: 사내 SSO 시스템과 연동
- ✅ **일반 로그인**: 이메일/비밀번호 기반 로그인
- ✅ **한국어 우선**: 한국어 및 한국 시간대 기본 설정
- ✅ **모던 UI**: Next.js + Tailwind + shadcn/ui 기반 세련된 UI

## 기술 스택

- **프론트엔드**: Next.js 16, React 19, TypeScript
- **스타일링**: Tailwind CSS 4, shadcn/ui
- **데이터베이스**: PostgreSQL 16
- **캐시/세션**: Redis 7
- **첨부파일 저장소**: MinIO
- **메일 서버**: Stalwart Mail (RocksDB, MinIO)

## 프로젝트 구조

```
comin-mail/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── releases/          # 릴리즈 노트
│   └── api/               # API 라우트
├── components/             # React 컴포넌트
│   └── ui/                # shadcn/ui 컴포넌트
├── lib/                   # 유틸리티 및 라이브러리
│   ├── config/            # 환경 설정
│   ├── db/                # 데이터베이스 클라이언트
│   ├── mail/              # 메일 프로토콜 클라이언트
│   ├── auth/              # 인증 로직
│   └── generated/         # Prisma 생성 파일
├── prisma/                # Prisma 스키마 및 마이그레이션
├── docker/                # Docker 관련 파일
│   └── postgres/          # PostgreSQL 초기화 스크립트
└── public/                # 정적 파일
```

## 배포 (Docker Hub)

OwlPost는 Docker Hub를 통해 배포됩니다. 최신 버전을 받아서 사용할 수 있습니다.

```bash
# 최신 버전 다운로드 및 실행
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

## 시작하기

### 사전 요구사항

- Node.js 20 이상
- Docker 및 Docker Compose
- PostgreSQL (Docker로 실행 가능)

### 빠른 시작 (Docker Compose)

1. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 설정을 입력하세요
```

2. Docker Compose로 서비스 시작

```bash
docker-compose up -d
```

이 명령어는 다음을 자동으로 수행합니다:

- PostgreSQL, Redis, MinIO 컨테이너 시작
- 의존성 설치
- Prisma 클라이언트 생성
- 데이터베이스 마이그레이션 실행
- 개발 서버 시작

3. 애플리케이션 접속

- 웹 애플리케이션: http://localhost:3000
- MinIO 콘솔: http://localhost:9001 (minioadmin/minioadmin)

### 로컬 개발 (Docker 없이)

1. 저장소 클론

```bash
git clone <repository-url>
cd comin-mail
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 설정을 입력하세요
```

4. 데이터베이스 마이그레이션

```bash
npm run db:migrate
```

5. 개발 서버 시작

```bash
npm run dev
```

애플리케이션은 http://localhost:3000 에서 실행됩니다.

## 환경 변수

주요 환경 변수는 `.env.example` 파일을 참고하세요.

- `NODE_ENV`: `production` 또는 `develop` (기본값: `develop`)
- `LOG_LEVEL`: 로그 레벨 (`error`, `warn`, `info`, `debug`)
  - `production` 모드 기본값: `warn`
  - `develop` 모드 기본값: `debug`
- `DATABASE_URL`: PostgreSQL 연결 URL
- `REDIS_URL`: Redis 연결 URL
- `NEXTAUTH_SECRET`: NextAuth 시크릿 키
- `OAUTH_*`: OAuth SSO 설정

## 데이터베이스

### PostgreSQL

- 사용자/설정 저장
- 한국어 및 한국 시간대 설정
- Prisma ORM 사용

### RocksDB

- Stalwart Mail이 관리
- 메일 메타데이터 및 본문 저장

### MinIO

- 첨부파일 저장소
- S3 호환 API

## Docker Compose 명령어

```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f webapp

# 특정 서비스 재시작
docker-compose restart webapp

# 데이터베이스 마이그레이션 재실행
docker-compose exec webapp npx prisma migrate deploy

# Prisma Studio 실행
docker-compose exec webapp npx prisma studio
```

## 릴리즈 노트

릴리즈 노트는 `/releases` 페이지에서 확인할 수 있습니다.

현재 버전: **0.0.1**

## 개발

### 스크립트

- `npm run dev`: 개발 서버 시작
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 시작
- `npm run lint`: ESLint 실행
- `npm run format`: Prettier로 코드 포맷팅

### 데이터베이스 마이그레이션

```bash
# 마이그레이션 생성
npm run db:migrate

# 마이그레이션 적용 (프로덕션)
npx prisma migrate deploy

# Prisma Studio 실행
npm run db:studio
```

## 라이선스

사내 전용 소프트웨어

## 기여

이 프로젝트는 사내 전용 프로젝트입니다.
