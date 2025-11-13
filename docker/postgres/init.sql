-- OwlPost - PostgreSQL 초기화 스크립트
-- 한국어 및 한국 시간대 설정

-- 데이터베이스 인코딩 및 로케일 설정
SET timezone = 'Asia/Seoul';
SET lc_time = 'ko_KR.UTF-8';
SET lc_messages = 'ko_KR.UTF-8';
SET lc_monetary = 'ko_KR.UTF-8';
SET lc_numeric = 'ko_KR.UTF-8';

-- 한국어 정렬 규칙 설정
CREATE COLLATION IF NOT EXISTS "ko_KR" (LOCALE = "ko_KR.UTF-8");

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 텍스트 검색용

-- 타임존 확인
SHOW timezone;

