'''
# API 키 및 환경 변수 설정 가이드 (keysetting.md)

이 프로젝트를 정상적으로 실행하고 배포하기 위해서는 Supabase에서 발급받은 API 키를 설정해야 합니다. 이 문서는 어떤 값을 어디에 설정해야 하는지 안내합니다.

## 필요한 키

프로젝트는 Supabase와 연동되며, 다음 두 가지 키가 필요합니다.

1.  **Supabase Project URL**: Supabase 프로젝트의 고유 URL입니다.
2.  **Supabase Anon Key**: Supabase 프로젝트의 공개용(anon) API 키입니다.

## 키 확인 방법

1.  [Supabase 대시보드](https://supabase.com/dashboard)에 로그인합니다.
2.  해당 프로젝트를 선택합니다.
3.  왼쪽 메뉴에서 **Settings** (톱니바퀴 아이콘) > **API**로 이동합니다.
4.  **Project API keys** 섹션에서 다음 두 값을 복사할 수 있습니다.
    -   `URL` (Project URL)
    -   `public` / `anon` 키 (Project API Key)

## 키 설정 방법

프로젝트 루트 디렉토리에 있는 `.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성합니다. 그 후, 복사한 값을 아래와 같이 붙여넣습니다.

```.env.local
# .env.local.example 파일을 복사하여 생성하세요.

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

-   `your_supabase_project_url` 부분을 복사한 **Project URL** 값으로 교체합니다.
-   `your_supabase_anon_key` 부분을 복사한 **anon key** 값으로 교체합니다.

**주의**: `.env.local` 파일은 민감한 정보를 포함하므로, Git과 같은 버전 관리 시스템에 커밋해서는 안 됩니다. 프로젝트의 `.gitignore` 파일에 이미 해당 파일이 포함되어 있습니다.

## 배포 시 설정

Vercel 등 호스팅 서비스에 배포할 때는 해당 서비스의 대시보드에서 동일한 이름(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)으로 환경 변수를 설정해야 합니다. 자세한 내용은 `deploy.md` 문서를 참고하세요.

'''
