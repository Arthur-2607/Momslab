import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server/auth/session.server'

export async function GET() {
    const session = await getServerSession()

    return NextResponse.json({
        authenticated: !!session.user,
        session: {
            type: session.type,
            role: session.role,
            user: session.user ? {
                ...(session.type === 'admin' ? {
                    adminId: (session.user as any).adminId,
                    username: (session.user as any).username,
                    role: (session.user as any).role,
                    branchId: (session.user as any).branchId,
                } : {
                    customerId: (session.user as any).customerId,
                    email: (session.user as any).email,
                    name: (session.user as any).name,
                }),
            } : null,
        },
    })
}

