import type { User, Admin } from "./types"
import { mockUser, mockAdmins } from "./mock-data"

const USER_KEY = "momslab_user"
const ADMIN_KEY = "momslab_admin"
const TOKEN_KEY = "momslab_token"

// This ensures users start in a non-logged-in state when first visiting

// 고객 인증
export function loginWithKakao(): User {
  // Mock Kakao login
  const user = mockUser
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  sessionStorage.setItem(TOKEN_KEY, `mock_token_${user.id}`)
  return user
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const token = sessionStorage.getItem(TOKEN_KEY)
  if (!token) {
    // If no token, clear any stale user data
    sessionStorage.removeItem(USER_KEY)
    return null
  }

  const userStr = sessionStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export function logoutUser(): void {
  sessionStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

// 관리자 인증
export function loginAdmin(username: string, password: string): Admin | null {
  const admin = mockAdmins.find((a) => a.username === username && a.password === password)

  if (admin) {
    const { password: _, ...adminWithoutPassword } = admin
    sessionStorage.setItem(ADMIN_KEY, JSON.stringify(adminWithoutPassword))
    sessionStorage.setItem(TOKEN_KEY, `mock_admin_token_${admin.id}`)
    return adminWithoutPassword as Admin
  }

  return null
}

export function getCurrentAdmin(): Omit<Admin, "password"> | null {
  if (typeof window === "undefined") return null

  const token = sessionStorage.getItem(TOKEN_KEY)
  if (!token) {
    // If no token, clear any stale admin data
    sessionStorage.removeItem(ADMIN_KEY)
    return null
  }

  const adminStr = sessionStorage.getItem(ADMIN_KEY)
  return adminStr ? JSON.parse(adminStr) : null
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(ADMIN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!sessionStorage.getItem(TOKEN_KEY)
}
