import { cookies, headers } from 'next/headers'
import { verifyAccessToken, type AdminJWTPayload, type CustomerJWTPayload } from '@/lib/jwt'

export type ServerSession = {
    user: AdminJWTPayload | CustomerJWTPayload | null
    type: 'admin' | 'customer' | null
    role?: 'super_admin' | 'branch_owner'
}

/**
 * Get current session from server-side (Server Components, Server Actions, Route Handlers)
 * This reads from cookies and verifies JWT tokens
 */
export async function getServerSession(): Promise<ServerSession> {
    const cookieStore = await cookies()

    // Try admin token first
    const adminToken = cookieStore.get('admin_access_token')
    if (adminToken) {
        try {
            const payload = verifyAccessToken(adminToken.value)
            if (payload && payload.type === 'admin') {
                const adminPayload = payload as AdminJWTPayload
                return {
                    user: adminPayload,
                    type: 'admin',
                    role: adminPayload.role,
                }
            }
        } catch (error) {
            console.error('[Session] Invalid admin token:', error)
        }
    }

    // Try customer token
    const customerToken = cookieStore.get('customer_access_token')
    if (customerToken) {
        try {
            const payload = verifyAccessToken(customerToken.value)
            if (payload && payload.type === 'customer') {
                return {
                    user: payload as CustomerJWTPayload,
                    type: 'customer',
                }
            }
        } catch (error) {
            console.error('[Session] Invalid customer token:', error)
        }
    }

    return { user: null, type: null }
}

/**
 * Get session from middleware-injected headers (faster, no token verification needed)
 * Use this in Server Components when middleware has already verified the session
 */
export async function getSessionFromHeaders(): Promise<ServerSession> {
    const headersList = await headers()
    const userType = headersList.get('x-user-type') as 'admin' | 'customer' | null

    if (userType === 'admin') {
        const adminId = headersList.get('x-admin-id')
        const username = headersList.get('x-admin-username')
        const role = headersList.get('x-admin-role') as 'super_admin' | 'branch_owner'
        const branchId = headersList.get('x-admin-branch-id')

        if (adminId && username && role) {
            return {
                user: {
                    adminId,
                    username,
                    name: username,
                    role,
                    branchId: branchId || undefined,
                    type: 'admin',
                } as AdminJWTPayload,
                type: 'admin',
                role,
            }
        }
    } else if (userType === 'customer') {
        const customerId = headersList.get('x-customer-id')
        const email = headersList.get('x-customer-email')
        const name = headersList.get('x-customer-name')

        if (customerId && email) {
            return {
                user: {
                    customerId,
                    email,
                    name: name || undefined,
                    type: 'customer',
                } as CustomerJWTPayload,
                type: 'customer',
            }
        }
    }

    return { user: null, type: null }
}

/**
 * Require admin session (throws if not admin)
 */
export async function requireAdmin(): Promise<AdminJWTPayload> {
    const session = await getServerSession()
    if (session.type !== 'admin' || !session.user) {
        throw new Error('Unauthorized: Admin access required')
    }
    return session.user as AdminJWTPayload
}

/**
 * Require customer session (throws if not customer)
 */
export async function requireCustomer(): Promise<CustomerJWTPayload> {
    const session = await getServerSession()
    if (session.type !== 'customer' || !session.user) {
        throw new Error('Unauthorized: Customer access required')
    }
    return session.user as CustomerJWTPayload
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: 'super_admin' | 'branch_owner'): Promise<boolean> {
    const session = await getServerSession()
    return session.type === 'admin' && session.role === role
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
    return hasRole('super_admin')
}

/**
 * Check if user is branch owner
 */
export async function isBranchOwner(): Promise<boolean> {
    return hasRole('branch_owner')
}

