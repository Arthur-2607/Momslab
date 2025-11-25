import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { signAccessToken, signRefreshToken, type CustomerJWTPayload } from '@/lib/jwt'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors from Kakao
  if (error) {
    console.error('[Kakao OAuth] Error from provider:', error, errorDescription)

    let userMessage = '카카오 로그인에 실패했습니다.'

    if (error === 'consent_required' || errorDescription?.includes('consent')) {
      userMessage = '필수 동의 항목에 동의가 필요합니다. 다시 시도해주세요.'
    } else if (error === 'access_denied') {
      userMessage = '로그인이 취소되었습니다.'
    }

    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(userMessage)}`, request.url))
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Kakao OAuth] Callback error:', error)

      // Handle specific error types
      let errorMessage = error.message

      if (error.message.includes('consent') || error.message.includes('scope')) {
        errorMessage = '카카오 로그인 동의 항목 설정이 필요합니다. 관리자에게 문의하세요.'
      } else if (error.message.includes('redirect')) {
        errorMessage = 'Redirect URI 설정 오류입니다. 관리자에게 문의하세요.'
      } else if (error.message.includes('invalid_client')) {
        errorMessage = 'API 키 설정 오류입니다. 관리자에게 문의하세요.'
      }

      // Redirect to login with error message
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url))
    }

    // If OAuth successful, generate JWT tokens
    if (data?.user) {
      console.log('[Kakao OAuth] User authenticated:', data.user.id)

      // Create JWT payload for the customer
      const jwtPayload: CustomerJWTPayload = {
        customerId: data.user.id,
        email: data.user.email || `kakao_${data.user.id}@placeholder.local`, // Email is optional for Kakao
        name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '카카오 사용자',
        type: 'customer'
      }

      // Generate JWT tokens
      const accessToken = signAccessToken(jwtPayload)
      const refreshToken = signRefreshToken(jwtPayload)

      // Store tokens in HTTP-only cookies
      const cookieStore = await cookies()

      // Access token (15 minutes)
      cookieStore.set("customer_access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 15,
        path: "/",
      })

      // Refresh token (7 days)
      cookieStore.set("customer_refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })

      console.log('[Kakao OAuth] JWT tokens generated and stored')
    }
  }

  return NextResponse.redirect(new URL(redirect, request.url))
}
