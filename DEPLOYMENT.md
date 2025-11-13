# OwlPost 배포 가이드

## Docker Hub에서 배포하기

OwlPost는 Docker Hub를 통해 배포됩니다. 최신 버전을 받아서 사용할 수 있습니다.

### 빠른 시작

1. **환경 변수 파일 생성**

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

# Stalwart Mail (선택사항)
STALWART_IMAP_HOST=stalwart-mail
STALWART_SMTP_HOST=stalwart-mail
STALWART_JMAP_URL=http://stalwart-mail:8080/jmap

# OAuth (선택사항)
OAUTH_ENABLED=false
EOF
```

2. **Docker Compose로 시작**

```bash
# Docker Hub에서 최신 이미지 다운로드
docker-compose -f docker-compose.prod.yml pull

# 서비스 시작
docker-compose -f docker-compose.prod.yml up -d
```

3. **관리자 계정 생성**

```bash
# 컨테이너 내부에서 관리자 계정 생성
docker-compose -f docker-compose.prod.yml exec webapp npm run create-admin
```

4. **애플리케이션 접속**

- 웹 애플리케이션: http://localhost:3000
- MinIO 콘솔: http://localhost:9001

### 환경 변수

주요 환경 변수는 `.env.example` 파일을 참고하세요.

#### 필수 환경 변수

- `NEXTAUTH_SECRET`: NextAuth 시크릿 키 (랜덤 문자열 생성 권장)
- `POSTGRES_PASSWORD`: PostgreSQL 비밀번호
- `MINIO_ACCESS_KEY`: MinIO 접근 키
- `MINIO_SECRET_KEY`: MinIO 시크릿 키

#### 선택적 환경 변수

- `APP_URL`: 애플리케이션 URL
- `NEXTAUTH_URL`: NextAuth 콜백 URL
- `OAUTH_*`: OAuth SSO 설정
- `STALWART_*`: Stalwart Mail 서버 설정

### Docker 이미지 태그

- `latest`: 최신 안정 버전
- `v0.0.1`: 특정 버전
- `main`: 최신 개발 버전 (main 브랜치)

### 업데이트

최신 버전으로 업데이트하려면:

```bash
# 최신 이미지 다운로드
docker-compose -f docker-compose.prod.yml pull

# 서비스 재시작
docker-compose -f docker-compose.prod.yml up -d
```

### 데이터 백업

중요한 데이터는 Docker 볼륨에 저장됩니다:

```bash
# 볼륨 목록 확인
docker volume ls | grep owlpost

# 백업
docker run --rm -v owlpost_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
docker run --rm -v owlpost_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio_backup.tar.gz /data
```

### 문제 해결

#### 데이터베이스 마이그레이션 오류

```bash
# 수동으로 마이그레이션 실행
docker-compose -f docker-compose.prod.yml exec webapp npx prisma migrate deploy
```

#### 로그 확인

```bash
# 모든 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f webapp
```

### 프로덕션 배포 권장사항

1. **환경 변수 보안**: `.env` 파일을 안전하게 관리하세요
2. **HTTPS**: 리버스 프록시(Nginx, Traefik)를 사용하여 HTTPS 설정
3. **방화벽**: 필요한 포트만 열어두세요
4. **모니터링**: 로그 및 메트릭 수집 도구 사용
5. **백업**: 정기적인 데이터 백업 계획 수립

