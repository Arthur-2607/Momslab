import { type NextRequest, NextResponse } from "next/server"
import { verifyAccessTokenEdge } from "@/lib/jwt-edge"
import type { AdminJWTPayload, CustomerJWTPayload } from "@/lib/jwt"

function normalizePath(pathname: string): string {
    // Map "/_next/data/<buildId>/.../page.json" -> "/.../page"
    const m = pathname.match(/^\/_next\/data\/[^/]+(\/.*)\.json$/);
    return m ? m[1] : pathname;
}

// Helper to get session from cookies
async function getSession(request: NextRequest): Promise<{
    user: (AdminJWTPayload | CustomerJWTPayload) | null,
    type: 'admin' | 'customer' | null,
    role?: 'super_admin' | 'branch_owner'
}> {
    // Check for admin token first
    const adminToken = request.cookies.get("admin_access_token")
    if (adminToken) {
        const payload = await verifyAccessTokenEdge(adminToken.value)
        if (payload && payload.type === 'admin') {
            return {
                user: payload as AdminJWTPayload,
                type: 'admin',
                role: (payload as AdminJWTPayload).role
            }
        }
    }

    // Check for customer token
    const customerToken = request.cookies.get("customer_access_token")
    if (customerToken) {
        const payload = await verifyAccessTokenEdge(customerToken.value)
        if (payload && payload.type === 'customer') {
            return {
                user: payload as CustomerJWTPayload,
                type: 'customer'
            }
        }
    }

    return { user: null, type: null }
}

export async function middleware(request: NextRequest) {
    let { pathname } = request.nextUrl
    pathname = normalizePath(pathname)

    // Get session from cookies
    const session = await getSession(request)

    console.log(`[Middleware] Path: ${pathname} | Session: ${session.type || 'none'} | Role: ${session.role || 'N/A'}`)

    // ==================== ADMIN ROUTES ====================
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        // Must be logged in as admin
        if (session.type !== 'admin' || !session.user) {
            console.log("[Middleware] ❌ Admin route requires admin session")
            return NextResponse.redirect(new URL("/admin/login", request.url))
        }

        const adminUser = session.user as AdminJWTPayload
        console.log(`[Middleware] ✅ Admin authenticated: ${adminUser.username} (${session.role})`)

        // Add user info to headers for server components
        const response = NextResponse.next()
        response.headers.set('x-user-type', 'admin')
        response.headers.set('x-admin-id', adminUser.adminId)
        response.headers.set('x-admin-role', adminUser.role)
        response.headers.set('x-admin-username', adminUser.username)
        if (adminUser.branchId) {
            response.headers.set('x-admin-branch-id', adminUser.branchId)
        }

        return response
    }

    // ==================== BRANCH/CUSTOMER ROUTES ====================
    const pathSegments = pathname.split('/').filter(Boolean)

    // Skip home page, auth routes, API routes, and admin routes
    if (pathname === '/' ||
        pathSegments.length === 0 ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/admin')) {
        console.log("[Middleware] Public/System route, allowing access")
        return NextResponse.next()
    }

    // Check if it's a root-level login or signup page (/login or /signup)
    if (pathSegments.length === 1 && (pathSegments[0] === 'login' || pathSegments[0] === 'signup')) {
        console.log("[Middleware] Root login/signup page, allowing access")
        return NextResponse.next()
    }

    // Check if it's a branch login or signup page (/{branchSlug}/login or /{branchSlug}/signup)
    if (pathSegments.length >= 2 && (pathSegments[1] === 'login' || pathSegments[1] === 'signup')) {
        console.log("[Middleware] Branch login/signup page, allowing access")
        return NextResponse.next()
    }

    // All other branch routes require customer authentication
    // This includes: /{branchSlug}/products, /{branchSlug}/checkout, /{branchSlug}/mypage, etc.
    if (pathSegments.length >= 1) {
        const branchSlug = pathSegments[0]

        // Must be logged in as customer (not admin)
        if (session.type !== 'customer' || !session.user) {
            console.log("[Middleware] ❌ Branch route requires customer session")
            const redirectUrl = `/${branchSlug}/login?redirect=${encodeURIComponent(pathname)}`
            return NextResponse.redirect(new URL(redirectUrl, request.url))
        }

        const customerUser = session.user as CustomerJWTPayload
        console.log(`[Middleware] ✅ Customer authenticated: ${customerUser.email}`)

        // Add user info to headers for server components
        const response = NextResponse.next()
        response.headers.set('x-user-type', 'customer')
        response.headers.set('x-customer-id', customerUser.customerId)
        response.headers.set('x-customer-email', customerUser.email)
        if (customerUser.name) {
            response.headers.set('x-customer-name', customerUser.name)
        }

        return response
    }

    // Fallback - allow access
    console.log("[Middleware] Fallback, allowing access")
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - admin/login (admin login page)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|admin/login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
