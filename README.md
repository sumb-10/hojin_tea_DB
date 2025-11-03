# 차 품평 데이터베이스 (Tea Assessment Database)

프로젝트 제안서와 디자인 샘플을 기반으로 제작된 차(Tea) 품평 기록 및 분석을 위한 웹 애플리케이션입니다.

## 주요 기능

- **차(Tea) 데이터베이스**: 차의 이름, 생산년도, 카테고리, 산지 등 기본 정보 관리
- **품평(Assessment) 시스템**: 표준화된 스코어링 시스템과 서술형 노트를 통한 품평 기록
- **사용자 인증**: Supabase Google OAuth를 통한 간편하고 안전한 로그인
- **권한 관리**: 관리자(admin), 패널(panel), 게스트(guest) 3단계 권한 시스템
- **데이터 시각화**: Recharts를 활용한 레이더 차트로 품평 결과 시각화
- **검색 및 필터**: 차 이름으로 간편하게 데이터 검색
- **데이터 내보내기**: 관리자를 위한 CSV, JSON 형식 데이터 다운로드 기능

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend/BFF**: Next.js Route Handlers
- **Database & Auth**: Supabase (PostgreSQL, Google OAuth, RLS)
- **UI Components**: Radix UI, shadcn/ui (스타일링 참고)
- **Deployment**: Vercel (Frontend), Supabase (Backend/DB)

## 시작하기

프로젝트를 로컬 환경에서 실행하고 개발을 시작하는 방법은 `envsetting.md` 파일을 참고해주세요.

## 배포

Vercel과 Supabase를 사용하여 웹 서비스를 배포하는 방법은 `deploy.md` 파일을 참고해주세요.

## 데이터베이스 스키마

Supabase 데이터베이스 설정에 필요한 전체 SQL 스키마는 `supabase/schema.sql` 파일에 정의되어 있습니다. 해당 파일을 Supabase 프로젝트의 SQL Editor에서 실행하여 테이블과 정책을 설정할 수 있습니다.

- `users`: 사용자 정보 및 권한
- `teas`: 차 마스터 정보
- `assessments`: 품평 세션 정보
- `assessment_scores`: 품평 항목별 점수
- `tea_average_scores`: 게스트에게 보여주기 위한 차별 평균 점수 뷰

Row Level Security (RLS) 정책이 적용되어 각 사용자의 권한에 따라 데이터 접근이 제어됩니다.
