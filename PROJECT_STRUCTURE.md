# 프로젝트 구조 (Project Structure)

본 문서는 차 품평 데이터베이스 프로젝트의 전체 파일 구조와 각 디렉토리 및 파일의 역할을 설명합니다.

## 디렉토리 구조

```
tea-assessment-db/
├── app/                          # Next.js App Router 디렉토리
│   ├── admin/                    # 관리자 페이지
│   │   ├── page.tsx              # 관리자 페이지 (서버 컴포넌트)
│   │   └── AdminClient.tsx       # 관리자 페이지 클라이언트 컴포넌트
│   ├── assessment/               # 품평 관련 페이지
│   │   └── new/                  # 품평 작성 페이지
│   │       ├── page.tsx          # 품평 작성 페이지 (서버 컴포넌트)
│   │       └── AssessmentForm.tsx # 품평 작성 폼 (클라이언트 컴포넌트)
│   ├── auth/                     # 인증 관련
│   │   └── callback/             # OAuth 콜백 처리
│   │       └── route.ts          # Google OAuth 콜백 라우트 핸들러
│   ├── tea/                      # 차 상세 페이지
│   │   └── [id]/                 # 동적 라우팅 (차 ID)
│   │       ├── page.tsx          # 차 상세 페이지 (서버 컴포넌트)
│   │       └── TeaDetailClient.tsx # 차 상세 클라이언트 컴포넌트
│   ├── globals.css               # 전역 스타일 (TailwindCSS)
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 홈 페이지 (차 목록)
│   └── TeaListClient.tsx         # 차 목록 클라이언트 컴포넌트
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                       # shadcn/ui 기반 UI 컴포넌트
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── sonner.tsx            # Toast 알림
│   │   └── ... (기타 UI 컴포넌트)
│   ├── Header.tsx                # 헤더 컴포넌트
│   ├── SearchBar.tsx             # 검색 바 컴포넌트
│   ├── TeaTable.tsx              # 차 목록 테이블 컴포넌트
│   └── Radar5.tsx                # 5각형 레이더 차트 컴포넌트
├── lib/                          # 유틸리티 및 라이브러리
│   ├── supabase/                 # Supabase 클라이언트 설정
│   │   ├── client.ts             # 브라우저용 Supabase 클라이언트
│   │   ├── server.ts             # 서버용 Supabase 클라이언트
│   │   └── middleware.ts         # Supabase 미들웨어
│   └── utils.ts                  # 공통 유틸리티 함수
├── supabase/                     # Supabase 관련 파일
│   ├── schema.sql                # 데이터베이스 스키마 (테이블, RLS 정책)
│   └── seed.sql                  # 샘플 데이터
├── public/                       # 정적 파일 (이미지, 파비콘 등)
├── .env.local.example            # 환경 변수 예시 파일
├── .gitignore                    # Git 무시 파일 목록
├── middleware.ts                 # Next.js 미들웨어 (인증 세션 관리)
├── next.config.ts                # Next.js 설정
├── package.json                  # 프로젝트 종속성 및 스크립트
├── pnpm-lock.yaml                # pnpm 잠금 파일
├── postcss.config.mjs            # PostCSS 설정
├── tailwind.config.ts            # TailwindCSS 설정
├── tsconfig.json                 # TypeScript 설정
├── README.md                     # 프로젝트 개요
├── changelog.md                  # 변경 이력
├── keysetting.md                 # API 키 설정 가이드
├── envsetting.md                 # 로컬 환경 설정 가이드
├── deploy.md                     # 배포 가이드
└── PROJECT_STRUCTURE.md          # 본 문서 (프로젝트 구조 설명)
```

## 주요 파일 및 디렉토리 설명

### `/app` 디렉토리
Next.js 14의 App Router를 사용하여 페이지와 라우팅을 관리합니다. 각 폴더는 URL 경로에 대응되며, `page.tsx` 파일이 해당 경로의 페이지를 정의합니다.

- **`page.tsx`**: 서버 컴포넌트로 데이터를 페칭하고 초기 렌더링을 담당합니다.
- **클라이언트 컴포넌트 (`*Client.tsx`)**: 사용자 인터랙션과 상태 관리를 담당합니다.

### `/components` 디렉토리
재사용 가능한 UI 컴포넌트를 모아둔 디렉토리입니다. `ui/` 폴더에는 Radix UI 기반의 기본 컴포넌트들이 있으며, 루트에는 프로젝트 특화 컴포넌트가 위치합니다.

### `/lib` 디렉토리
Supabase 클라이언트 설정과 공통 유틸리티 함수를 포함합니다. 서버와 클라이언트에서 각각 사용할 수 있는 Supabase 클라이언트를 분리하여 관리합니다.

### `/supabase` 디렉토리
데이터베이스 스키마와 초기 데이터를 정의하는 SQL 파일이 위치합니다. Supabase 프로젝트 설정 시 이 파일들을 SQL Editor에서 실행합니다.

### 설정 파일
- **`middleware.ts`**: 모든 요청에서 Supabase 인증 세션을 업데이트합니다.
- **`tailwind.config.ts`**: TailwindCSS 테마 및 플러그인 설정을 정의합니다.
- **`next.config.ts`**: Next.js 빌드 및 런타임 설정을 관리합니다.

### 문서 파일
- **`README.md`**: 프로젝트 개요 및 주요 기능 소개
- **`changelog.md`**: 버전별 변경 이력
- **`PROJECT_STRUCTURE.md`**: 본 문서 (프로젝트 구조 설명)
