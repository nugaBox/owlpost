#!/bin/sh
# OwlPost - Docker Compose 시작 스크립트

echo "🚀 OwlPost 서비스 시작 중..."

# .env 파일 확인
if [ ! -f .env ]; then
  echo "⚠️  .env 파일이 없습니다. .env.example을 복사합니다..."
  cp .env.example .env
  echo "✅ .env 파일이 생성되었습니다. 필요한 설정을 확인하세요."
fi

# Docker Compose로 서비스 시작
echo "📦 Docker Compose로 서비스 시작..."
docker-compose up -d

echo ""
echo "✅ 서비스가 시작되었습니다!"
echo ""
echo "📋 서비스 상태 확인:"
echo "   docker-compose ps"
echo ""
echo "📝 로그 확인:"
echo "   docker-compose logs -f webapp"
echo ""
echo "🌐 웹 애플리케이션: http://localhost:3000"
echo "📦 MinIO 콘솔: http://localhost:9001 (minioadmin/minioadmin)"
echo ""

