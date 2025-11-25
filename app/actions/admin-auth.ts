"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken, verifyRefreshToken, type AdminJWTPayload } from "@/lib/jwt"

export interface AdminAuthResult {
  success: boolean
  error?: string
  admin?: {
    id: string
    username: string
    name: string
    role: "super_admin" | "branch_owner"
    branchId?: string
  }
  accessToken?: string
  refreshToken?: string
}

/**
 * Sign in admin user
 * 
 * On success: Redirects to appropriate dashboard (never returns)
 * On failure: Returns error result
 * 
 * Note: redirect() throws a NEXT_REDIRECT error on success - this is expected Next.js behavior
 */
export async function signInAdmin(
  username: string,
  password: string
): Promise<AdminAuthResult> {
  const supabase = createAdminClient()

  // Query the admins table to find the user
  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("username", username.trim())
    .single()

  if (error || !admin) {
    return {
      success: false,
      error: "아이디 또는 비밀번호가 올바르지 않습니다.",
    }
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(password, admin.password_hash)

  if (!passwordMatch) {
    return {
      success: false,
      error: "아이디 또는 비밀번호가 올바르지 않습니다.",
    }
  }
  
  console.log("Admin authenticated:", admin.username)
  
  // Create JWT payload
  const jwtPayload: AdminJWTPayload = {
    adminId: admin.id,
    username: admin.username,
    name: admin.name,
    role: admin.role as "super_admin" | "branch_owner",
    branchId: admin.branch_id,
    type: 'admin'
  }

  // Generate tokens
  const accessToken = signAccessToken(jwtPayload)
  const refreshToken = signRefreshToken(jwtPayload)

  // Store tokens in httpOnly cookies
  const cookieStore = await cookies()
  
  // Access token (short-lived: 15 minutes)
  cookieStore.set("admin_access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  })

  // Refresh token (long-lived: 7 days)
  cookieStore.set("admin_refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return {
    success: true,
    admin: {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      branchId: admin.branch_id
    },
    accessToken,
    refreshToken
  }

}

export async function signOutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_access_token")
  cookieStore.delete("admin_refresh_token")
  redirect("/admin/login")
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const accessTokenCookie = cookieStore.get("admin_access_token")

  if (!accessTokenCookie) {
    return null
  }

  try {
    const { verifyAccessToken } = await import("@/lib/jwt")
    const payload = verifyAccessToken(accessTokenCookie.value)
    
    if (payload && payload.type === 'admin') {
      return payload as AdminJWTPayload
    }
    
    return null
  } catch {
    return null
  }
}

export async function refreshAdminToken(): Promise<AdminAuthResult> {
  const cookieStore = await cookies()
  const refreshTokenCookie = cookieStore.get("admin_refresh_token")

  if (!refreshTokenCookie) {
    return {
      success: false,
      error: "No refresh token found"
    }
  }

  const decoded = verifyRefreshToken(refreshTokenCookie.value)
  
  if (!decoded || decoded.type !== 'admin') {
    return {
      success: false,
      error: "Invalid refresh token"
    }
  }

  // Fetch admin data from database
  const supabase = createAdminClient()
  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("id", decoded.id)
    .single()

  if (error || !admin) {
    return {
      success: false,
      error: "Admin not found"
    }
  }

  // Create new JWT payload
  const jwtPayload: AdminJWTPayload = {
    adminId: admin.id,
    username: admin.username,
    name: admin.name,
    role: admin.role as "super_admin" | "branch_owner",
    branchId: admin.branch_id,
    type: 'admin'
  }

  // Generate new access token
  const accessToken = signAccessToken(jwtPayload)

  // Update access token cookie
  cookieStore.set("admin_access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  })

  return {
    success: true,
    admin: {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      branchId: admin.branch_id
    },
    accessToken
  }
}
