import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { signAccessToken, signRefreshToken, type CustomerJWTPayload } from '@/lib/jwt'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const state = requestUrl.searchParams.get('state')
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

    // Decode state to get redirect URL
    let redirectUrl = '/'
    try {
        if (state) {
            const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
            redirectUrl = decoded.redirect || '/'
        }
    } catch (e) {
        console.error('[Kakao OAuth] Failed to decode state:', e)
    }

    if (!code) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('인증 코드가 없습니다')}`, request.url))
    }

    try {
        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_CLIENT_ID!,
                redirect_uri: `${requestUrl.origin}/auth/kakao/callback`,
                code: code,
            }),
        })

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text()
            console.error('[Kakao OAuth] Token exchange failed:', errorData)
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent('토큰 교환에 실패했습니다')}`, request.url)
            )
        }

        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token

        // Get user info from Kakao
        const userInfoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
        })

        if (!userInfoResponse.ok) {
            console.error('[Kakao OAuth] User info fetch failed')
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent('사용자 정보를 가져오지 못했습니다')}`, request.url)
            )
        }

        const kakaoUser = await userInfoResponse.json()
        console.log('[Kakao OAuth] User info:', kakaoUser)

        // Extract user data
        const userId = `kakao_${kakaoUser.id}`
        const nickname = kakaoUser.kakao_account?.profile?.nickname || '카카오 사용자'
        const profileImage = kakaoUser.kakao_account?.profile?.profile_image_url
        const email = kakaoUser.kakao_account?.email || `${userId}@kakao.placeholder`

        // Store user in Supabase (optional - for record keeping)
        const supabase = await createClient()

        // Check if customer exists in database
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('email', email)
            .single()

        let customerId = existingCustomer?.id

        // Create customer if doesn't exist
        if (!customerId) {
            const { data: newCustomer, error: insertError } = await supabase
                .from('customers')
                .insert({
                    email: email,
                    name: nickname,
                    phone: '', // Kakao doesn't provide phone in basic scope
                })
                .select('id')
                .single()

            if (insertError) {
                console.error('[Kakao OAuth] Failed to create customer:', insertError)
                return NextResponse.redirect(
                    new URL(`/login?error=${encodeURIComponent('사용자 생성에 실패했습니다')}`, request.url)
                )
            }

            customerId = newCustomer.id
        }

        // Create JWT payload for the customer
        const jwtPayload: CustomerJWTPayload = {
            customerId: customerId!,
            email: email,
            name: nickname,
            type: 'customer'
        }

        // Generate JWT tokens
        const jwtAccessToken = signAccessToken(jwtPayload)
        const jwtRefreshToken = signRefreshToken(jwtPayload)

        // Store tokens in HTTP-only cookies
        const cookieStore = await cookies()

        // Access token (15 minutes)
        cookieStore.set("customer_access_token", jwtAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 15,
            path: "/",
        })

        // Refresh token (7 days)
        cookieStore.set("customer_refresh_token", jwtRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        })

        console.log('[Kakao OAuth] Login successful, redirecting to:', redirectUrl)

        return NextResponse.redirect(new URL(redirectUrl, request.url))
    } catch (error) {
        console.error('[Kakao OAuth] Unexpected error:', error)
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent('로그인 중 오류가 발생했습니다')}`, request.url)
        )
    }
}

