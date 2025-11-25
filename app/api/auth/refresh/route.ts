import { NextRequest, NextResponse } from 'next/server'
import { refreshAdminToken } from '@/app/actions/admin-auth'
import { refreshCustomerToken } from '@/app/actions/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    if (type === 'admin') {
      const result = await refreshAdminToken()
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to refresh token' },
          { status: 401 }
        )
      }

      return NextResponse.json({
        success: true,
        accessToken: result.accessToken,
        admin: result.admin
      })
    } else if (type === 'customer') {
      const result = await refreshCustomerToken()
      
      if ('error' in result) {
        return NextResponse.json(
          { error: result.error },
          { status: 401 }
        )
      }

      return NextResponse.json({
        success: true,
        accessToken: result.accessToken
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "admin" or "customer"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST instead.' },
    { status: 405 }
  )
}

