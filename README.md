# OwlPost - 사내 웹메일 클라이언트

OwlPost는 사내에서 사용할 수 있는 모던한 웹메일 클라이언트입니다. IMAP/SMTP/JMAP 프로토콜을 지원하며, Stalwart Mail 서버와 연동됩니다.

## 주요 기능

- ✅ **IMAP/SMTP/JMAP 지원**: 표준 메일 프로토콜 및 최신 JMAP 프로토콜 지원
- ✅ **Stalwart Mail 연동**: Stalwart Mail 서버와 완벽한 연동
- ✅ **OAuth SSO 로그인**: 사내 SSO 시스템과 연동 (선택사항)
- ✅ **이메일/비밀번호 로그인**: 기본 로그인 방식
- ✅ **한국어 우선**: 한국어 및 한국 시간대 기본 설정
- ✅ **모던 UI**: Next.js + Tailwind + shadcn/ui 기반 세련된 UI

## 빠른 시작

### 1. 환경 변수 파일 생성

```bash
cat > .env << EOF
# 필수 설정
NEXTAUTH_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
MINIO_ACCESS_KEY=$(openssl rand -base64 16)
MINIO_SECRET_KEY=$(openssl rand -base64 32)

# 애플리케이션 설정
APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# 데이터베이스
POSTGRES_USER=owlpost
POSTGRES_DB=owlpost

# MinIO
MINIO_BUCKET_NAME=owlpost-attachments

# OAuth (선택사항, 기본값: false)
OAUTH_ENABLED=false
EOF
```

### 2. Docker Compose로 시작

```bash
# Docker Hub에서 최신 이미지 자동 다운로드 및 실행
docker-compose -f docker-compose.prod.yml up -d
```

이 명령어는 자동으로:

- Docker Hub에서 최신 이미지를 다운로드 (`pull_policy: always`)
- PostgreSQL, Redis, MinIO 컨테이너 시작
- 데이터베이스 마이그레이션 자동 실행
- 웹 애플리케이션 시작

### 3. 관리자 계정 생성

```bash
# 관리자 계정 생성 (이미 존재하면 메시지만 출력)
docker-compose -f docker-compose.prod.yml exec webapp npm run create-admin admin@comin.com comin1q2w 관리자
```

### 4. 로그인

1. 웹 브라우저에서 http://localhost:3000 접속
2. "로그인" 버튼 클릭
3. "이메일/비밀번호" 탭 선택
4. 생성한 관리자 계정의 이메일과 비밀번호 입력
5. 로그인 완료 → 메일 메인 화면으로 이동

## 접속 주소

- **웹 애플리케이션**: http://localhost:3000
- **MinIO 콘솔**: http://localhost:9001 (기본: minioadmin/minioadmin)

## 환경 변수

### 필수 환경 변수

- `NEXTAUTH_SECRET`: NextAuth 시크릿 키 (랜덤 문자열 생성 권장)
- `POSTGRES_PASSWORD`: PostgreSQL 비밀번호
- `MINIO_ACCESS_KEY`: MinIO 접근 키
- `MINIO_SECRET_KEY`: MinIO 시크릿 키

### 선택적 환경 변수

- `APP_URL`: 애플리케이션 URL (기본: http://localhost:3000)
- `NEXTAUTH_URL`: NextAuth 콜백 URL (기본: http://localhost:3000)
- `OAUTH_ENABLED`: OAuth SSO 활성화 (기본: false)
- `OAUTH_PROVIDER`: OAuth 제공자 이름
- `OAUTH_CLIENT_ID`: OAuth 클라이언트 ID
- `OAUTH_CLIENT_SECRET`: OAuth 클라이언트 시크릿
- `OAUTH_AUTHORIZATION_URL`: OAuth 인증 URL
- `OAUTH_TOKEN_URL`: OAuth 토큰 URL
- `OAUTH_USERINFO_URL`: OAuth 사용자 정보 URL
- `STALWART_IMAP_HOST`: Stalwart Mail IMAP 호스트 (기본: stalwart-mail)
- `STALWART_SMTP_HOST`: Stalwart Mail SMTP 호스트 (기본: stalwart-mail)
- `STALWART_JMAP_URL`: Stalwart Mail JMAP URL (기본: http://stalwart-mail:8080/jmap)

## 데이터 저장 위치

모든 데이터는 Docker 볼륨에 저장됩니다:

- **PostgreSQL 데이터**: `owlpost_postgres_data` 볼륨
- **Redis 데이터**: `owlpost_redis_data` 볼륨
- **MinIO 데이터**: `owlpost_minio_data` 볼륨

## 업데이트

최신 버전으로 업데이트하려면:

```bash
# 서비스 중지
docker-compose -f docker-compose.prod.yml down

# 최신 이미지 다운로드 및 재시작
docker-compose -f docker-compose.prod.yml up -d
```

## 데이터 백업

```bash
# PostgreSQL 백업
docker run --rm -v owlpost_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data

# MinIO 백업
docker run --rm -v owlpost_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio_backup.tar.gz /data
```

## 문제 해결

### 관리자 계정 생성 오류

```bash
# 데이터베이스 연결 확인
docker-compose -f docker-compose.prod.yml ps

# 수동으로 마이그레이션 실행
docker-compose -f docker-compose.prod.yml exec webapp npx prisma migrate deploy
```

### 로그 확인

```bash
# 모든 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f

# 웹앱 로그만
docker-compose -f docker-compose.prod.yml logs -f webapp
```

### 서비스 재시작

```bash
# 특정 서비스 재시작
docker-compose -f docker-compose.prod.yml restart webapp

# 모든 서비스 재시작
docker-compose -f docker-compose.prod.yml restart
```

## 기술 스택

- **프론트엔드**: Next.js 16, React 19, TypeScript
- **스타일링**: Tailwind CSS 4, shadcn/ui
- **데이터베이스**: PostgreSQL 16
- **캐시/세션**: Redis 7
- **첨부파일 저장소**: MinIO
- **인증**: NextAuth v5
- **ORM**: Prisma

## 프로젝트 구조

```
owlpost/
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

## 개발

### Docker Compose로 개발 환경 시작/중지

#### 시작하기

```bash
# 개발 환경 시작 (백그라운드)
docker-compose -f docker-compose.dev.yml up -d

# 또는 로그를 보면서 시작
docker-compose -f docker-compose.dev.yml up
```

#### 중지하기

```bash
# 서비스 중지 (컨테이너는 유지, 데이터는 보존)
docker-compose -f docker-compose.dev.yml stop

# 서비스 중지 및 컨테이너 제거 (볼륨은 유지, 데이터는 보존)
docker-compose -f docker-compose.dev.yml down

# ⚠️ 주의: 모든 데이터 삭제 (볼륨까지 제거)
docker-compose -f docker-compose.dev.yml down -v
```

#### 상태 확인

```bash
# 실행 중인 서비스 확인
docker-compose -f docker-compose.dev.yml ps

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f

# 특정 서비스 로그만 확인
docker-compose -f docker-compose.dev.yml logs -f webapp
docker-compose -f docker-compose.dev.yml logs -f postgres
```

#### 재시작

```bash
# 모든 서비스 재시작
docker-compose -f docker-compose.dev.yml restart

# 특정 서비스만 재시작
docker-compose -f docker-compose.dev.yml restart webapp
```

#### 데이터베이스 마이그레이션

```bash
# 마이그레이션 실행
docker-compose -f docker-compose.dev.yml exec webapp npx prisma migrate dev

# Prisma 클라이언트 재생성
docker-compose -f docker-compose.dev.yml exec webapp npx prisma generate

# 데이터베이스 스키마 동기화 (마이그레이션 없이)
docker-compose -f docker-compose.dev.yml exec webapp npx prisma db push
```

#### 관리자 계정 생성

```bash
# 관리자 계정 생성
docker-compose -f docker-compose.dev.yml exec webapp npm run create-admin <email> <password> [name]

# 예시
docker-compose -f docker-compose.dev.yml exec webapp npm run create-admin admin@example.com password123 관리자
```

### 로컬 개발 환경 설정 (Docker 없이)

Docker 없이 로컬에서 개발하려면:

1. **PostgreSQL, Redis, MinIO를 별도로 실행**하거나
2. **Docker Compose로 인프라만 실행**하고 Next.js는 로컬에서 실행

#### 인프라만 Docker로 실행

```bash
# 인프라만 시작 (webapp 제외)
docker-compose -f docker-compose.dev.yml up -d postgres redis minio

# 로컬에서 Next.js 개발 서버 실행
npm install
npm run db:generate
npm run db:push
npm run dev
```

### 스크립트

- `npm run dev`: 개발 서버 시작
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 시작
- `npm run lint`: ESLint 실행
- `npm run format`: Prettier로 코드 포맷팅
- `npm run create-admin <email> <password> [name]`: 관리자 계정 생성
- `npm run reset-password <email> <new-password>`: 비밀번호 재설정
- `npm run seed-dummy`: 테스트용 더미 데이터 생성 (테스트 계정, 받은 메일, 보낸 메일 등)

### 개발 환경 접속 주소

- **웹 애플리케이션**: http://localhost:3000
- **MinIO 콘솔**: http://localhost:9001 (기본: minioadmin/minioadmin)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 개발 환경 문제 해결

#### 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3000
lsof -i :5432
lsof -i :6379
lsof -i :9000
lsof -i :9001

# 프로세스 종료
kill -9 <PID>
```

#### 컨테이너 재생성

```bash
# 컨테이너 재생성 (볼륨은 유지)
docker-compose -f docker-compose.dev.yml up -d --force-recreate
```

## 라이선스

사내 전용 소프트웨어
