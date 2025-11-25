"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
import { signAccessToken, signRefreshToken, verifyRefreshToken, type CustomerJWTPayload } from "@/lib/jwt"

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string || email.split('@')[0] // Default name from email
  const phone = formData.get("phone") as string || ''
  const branchSlug = formData.get("branchSlug") as string

  try {
    // 1. Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('customers')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (checkError) {
      console.error('[SignUp] Check error:', checkError)
      return { error: `회원가입 확인 중 오류가 발생했습니다 (Error checking existing user): ${checkError.message}` }
    }

    if (existingUser) {
      return { error: '이미 가입된 이메일입니다 (Email already exists)' }
    }

    // 2. Get branch ID from slug
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('id')
      .eq('slug', branchSlug)
      .single()

    if (branchError || !branch) {
      console.error('[SignUp] Branch not found:', branchError)
      return { error: `지점 정보를 찾을 수 없습니다 (Branch not found): ${branchError?.message || 'Unknown error'}` }
    }

    // 3. Hash password using bcrypt
    const bcrypt = require('bcryptjs')
    const passwordHash = await bcrypt.hash(password, 10)

    // 4. Insert customer into database
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: name,
        email: email,
        phone: phone || null,
        password_hash: passwordHash, // Store hashed password
        branch_id: branch.id, // Associate with branch
      })
      .select('id, name, email, phone')
      .single()

    if (customerError) {
      console.error('[SignUp] Customer insert error:', customerError)
      return { error: `사용자 정보 저장에 실패했습니다 (Failed to save customer): ${customerError.message}` }
    }

    if (!customer) {
      return { error: '사용자 정보 저장에 실패했습니다 (Failed to create customer - no data returned)' }
    }

    console.log('[SignUp] Customer created:', customer.id)

    // 4. Generate JWT tokens with customer table ID
    const jwtPayload: CustomerJWTPayload = {
      customerId: customer.id,
      email: customer.email!,
      name: customer.name,
      type: 'customer'
    }

    const accessToken = signAccessToken(jwtPayload)
    const refreshToken = signRefreshToken(jwtPayload)

    // 5. Store tokens in HTTP-only cookies
    const cookieStore = await cookies()

    cookieStore.set("customer_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    })

    cookieStore.set("customer_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log('[SignUp] Tokens generated and stored')

    // 6. Redirect to products page
    revalidatePath(`/${branchSlug}/products`, "layout")
    redirect(`/${branchSlug}/products`)
  } catch (error) {
    // Re-throw Next.js redirect errors
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = (error as any).digest
      if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
        throw error
      }
    }

    console.error('[SignUp] Unexpected error:', error)
    return { error: `회원가입 중 오류가 발생했습니다 (Signup error): ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const branchSlug = formData.get("branchSlug") as string

  try {
    // 1. Fetch customer from database by email
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, email, phone, password_hash')
      .eq('email', email)
      .maybeSingle()

    if (customerError) {
      console.error('[SignIn] Database error:', customerError)
      return { error: `로그인 중 오류가 발생했습니다 (Database error): ${customerError.message}` }
    }

    if (!customer) {
      console.log('[SignIn] Customer not found for email:', email)
      return { error: '이메일 또는 비밀번호가 올바르지 않습니다 (Email or password incorrect)' }
    }

    // Check if password_hash exists
    if (!customer.password_hash) {
      console.error('[SignIn] Customer has no password_hash:', customer.id)
      return { error: '이 계정은 비밀번호가 설정되지 않았습니다 (This account has no password set). 카카오 로그인을 사용하거나 관리자에게 문의하세요 (Use Kakao login or contact admin).' }
    }

    // 2. Verify password
    const bcrypt = require('bcryptjs')
    const isPasswordValid = await bcrypt.compare(password, customer.password_hash)

    if (!isPasswordValid) {
      console.log('[SignIn] Password verification failed for:', email)
      return { error: '이메일 또는 비밀번호가 올바르지 않습니다 (Email or password incorrect)' }
    }

    console.log('[SignIn] Customer authenticated:', customer.id)

    // 3. Generate JWT tokens with customer table ID
    const jwtPayload: CustomerJWTPayload = {
      customerId: customer.id,
      email: customer.email!,
      name: customer.name,
      type: 'customer'
    }

    const accessToken = signAccessToken(jwtPayload)
    const refreshToken = signRefreshToken(jwtPayload)

    // 4. Store tokens in HTTP-only cookies
    const cookieStore = await cookies()

    cookieStore.set("customer_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    })

    cookieStore.set("customer_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log('[SignIn] Tokens generated and stored')

    // 5. Redirect to products page
    revalidatePath(`/${branchSlug}/products`, "layout")
    redirect(`/${branchSlug}/products`)
  } catch (error) {
    // Re-throw Next.js redirect errors
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = (error as any).digest
      if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
        throw error
      }
    }

    console.error('[SignIn] Unexpected error:', error)
    return { error: `로그인 중 오류가 발생했습니다 (Login error): ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function signInWithKakao(branchSlug: string, redirectUrl?: string) {
  try {
    const headersList = await headers()
    const host = headersList.get('host')

    // Better protocol detection
    let protocol = headersList.get('x-forwarded-proto')
    if (!protocol) {
      // Localhost defaults to http, production to https
      protocol = host?.includes('localhost') ? 'http' : 'https'
    }

    const origin = `${protocol}://${host}`
    const finalRedirect = redirectUrl || `/${branchSlug}/products`

    // Get Kakao Client ID from environment
    const kakaoClientId = process.env.KAKAO_CLIENT_ID

    if (!kakaoClientId) {
      console.error('[Kakao OAuth] KAKAO_CLIENT_ID not set')
      return { error: '카카오 로그인 설정이 올바르지 않습니다 (Kakao client ID not configured).' }
    }

    // Build direct Kakao OAuth URL
    const callbackUrl = `${origin}/auth/kakao/callback`
    const state = Buffer.from(JSON.stringify({
      redirect: finalRedirect,
      branchSlug
    })).toString('base64')

    const kakaoAuthUrl = new URL('https://kauth.kakao.com/oauth/authorize')
    kakaoAuthUrl.searchParams.set('client_id', kakaoClientId)
    kakaoAuthUrl.searchParams.set('redirect_uri', callbackUrl)
    kakaoAuthUrl.searchParams.set('response_type', 'code')
    kakaoAuthUrl.searchParams.set('state', state)
    // Only request minimal scopes - no account_email
    kakaoAuthUrl.searchParams.set('scope', 'profile_nickname,profile_image')

    console.log('[Kakao OAuth] Redirecting to:', kakaoAuthUrl.toString())

    // Redirect to Kakao
    redirect(kakaoAuthUrl.toString())
  } catch (error) {
    // Handle NEXT_REDIRECT error (this is expected when redirect() is called)
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = (error as any).digest
      if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
        throw error // Re-throw redirect - this is expected behavior
      }
    }

    // Only log actual errors
    console.error('[Kakao OAuth] Unexpected error:', error)
    return {
      error: `카카오 로그인 중 오류가 발생했습니다 (Kakao login error): ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Clear JWT tokens
  const cookieStore = await cookies()
  cookieStore.delete("customer_access_token")
  cookieStore.delete("customer_refresh_token")

  revalidatePath("/", "layout")
  redirect("/")
}

export async function getCustomerSession() {
  const cookieStore = await cookies()
  const accessTokenCookie = cookieStore.get("customer_access_token")

  if (!accessTokenCookie) {
    return null
  }

  try {
    const { verifyAccessToken } = await import("@/lib/jwt")
    const payload = verifyAccessToken(accessTokenCookie.value)

    if (payload && payload.type === 'customer') {
      return payload as CustomerJWTPayload
    }

    return null
  } catch {
    return null
  }
}

export async function refreshCustomerToken() {
  const cookieStore = await cookies()
  const refreshTokenCookie = cookieStore.get("customer_refresh_token")

  if (!refreshTokenCookie) {
    return { error: "No refresh token found" }
  }

  const decoded = verifyRefreshToken(refreshTokenCookie.value)

  if (!decoded || decoded.type !== 'customer') {
    return { error: "Invalid refresh token" }
  }

  // Fetch customer data from Supabase
  const supabase = await createClient()
  const { data: user, error } = await supabase.auth.getUser()

  if (error || !user.user) {
    return { error: "Customer not found" }
  }

  // Create new JWT payload
  const jwtPayload: CustomerJWTPayload = {
    customerId: user.user.id,
    email: user.user.email!,
    name: user.user.user_metadata?.name,
    type: 'customer'
  }

  // Generate new access token
  const accessToken = signAccessToken(jwtPayload)

  // Update access token cookie
  cookieStore.set("customer_access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  })

  return { success: true, accessToken }
}
