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

## 폴더 구조(예시)
src/
  app/
    (routes...)
    api/
      auth/
      teas/
      assessments/
    globals.css
  components/
    charts/
    ui/
  lib/
    supabase/
      client.ts   // browser client
      server.ts   // server-side client (Route Handlers)
  types/
  utils/
public/

## 로드맵

 필터/정렬 확장(산지/카테고리/년도 범위) (구현완료)
 고급 시각화(비교 레이더 차트, 추세선) (구현완료)
 관리자용 일괄 업로드/내보내기 UI (구현완료)
 멀티언어(i18n) 지원
 모바일 최적화 (구현완료)

## 시작하기

홈페이지 구글 로그인 후, tea_hojin에게 패널 승인 요청해주세요.
Panel은 품평 기록을 남길 수 있습니다.
Guest는 품평 기록 보기만 가능합니다.

## 문의

Maintainer: hojin
문의: 이슈 등록 또는 PR로 논의해주세요.

## license
본 프로젝트는 개인 웹사이트 제작 공부용 프로젝트입니다.
본 저장소의 코드와 문서는 MIT License를 따릅니다.