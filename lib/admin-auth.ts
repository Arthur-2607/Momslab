import type { Admin } from "./types"
import { mockAdmins } from "./mock-data"

const ADMIN_TOKEN_KEY = "admin_token"

export interface AdminAuthToken {
  adminId: string
  username: string
  role: "super_admin" | "branch_owner"
  branchId?: string
}

// Use app/actions/admin-auth.ts server actions instead
export function loginAdmin(username: string, password: string): Admin | null {
  console.warn("loginAdmin is deprecated. Use signInAdmin server action instead.")
  return null
}

export function getAdminToken(): AdminAuthToken | null {
  if (typeof window === "undefined") return null

  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY)
  if (!token) return null

  try {
    return JSON.parse(token)
  } catch {
    return null
  }
}

export function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return getAdminToken() !== null
}

export function isSuperAdmin(): boolean {
  const token = getAdminToken()
  return token?.role === "super_admin"
}

export function isBranchOwner(): boolean {
  const token = getAdminToken()
  return token?.role === "branch_owner"
}
