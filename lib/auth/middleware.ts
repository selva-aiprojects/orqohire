import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from './jwt'
import type { User, UserRole } from '@/types'

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<User | NextResponse> {
  const token =
    req.headers.get('authorization')?.replace('Bearer ', '') ??
    req.cookies.get('accessToken')?.value

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorised' },
      { status: 401 }
    )
  }

  const user = await verifyAccessToken(token)
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    )
  }

  return user
}

export function isNextResponse(val: unknown): val is NextResponse {
  return val instanceof NextResponse
}