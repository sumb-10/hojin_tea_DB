// lib/supabase/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
  // 미들웨어는 먼저 응답 객체를 만들어 두고, 끝까지 이것을 반환해야 쿠키가 일관됩니다.
  const response = NextResponse.next({ request })

  // ✅ 최신 가이드: PUBLISHABLE_KEY 표기 사용. 다만 혼용될 수 있으니 안전하게 fallback 준비
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? // 이전 템플릿 호환
    process.env.SUPABASE_ANON_KEY

  // ❗️미들웨어에서는 env 누락으로 절대 throw 되지 않게 '통과' 처리
  if (!supabaseUrl || !supabaseKey) {
    console.error(
      '[Supabase][middleware] Missing Supabase URL/Key. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or ANON) in Vercel.'
    )
    return response
  }

  // ✅ 미들웨어에서 쓰는 @supabase/ssr 클라이언트 (req/res 쿠키 브릿지)
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // 요청/응답 양쪽 쿠키를 동기화
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value) // 서버 컴포넌트로 전달될 쿠키
          response.cookies.set(name, value, options) // 브라우저로 전달될 쿠키
        })
      },
    },
  })

  try {
    // ⚠️ 공식 문서 권장: 미들웨어에서는 getUser()로 토큰을 재검증/갱신
    await supabase.auth.getUser()
  } catch (e) {
    console.error('[Supabase][middleware] getUser() failed:', e)
    // 실패해도 미들웨어는 막지 않음
  }

  return response
}
