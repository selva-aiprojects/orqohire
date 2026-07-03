import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db/pool'
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      )
    }

    const userRow = await queryOne<any>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]
    )
    if (!userRow) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, userRow.password_hash)
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = {
      id:         userRow.id,
      email:      userRow.email,
      name:       userRow.name,
      role:       userRow.role as any,
      clientName: userRow.client_name || undefined,
      createdAt:  userRow.created_at,
    }

    const accessToken  = await signAccessToken(user)
    const refreshToken = await signRefreshToken(user.id)

    const res = NextResponse.json({
      success: true,
      data: { user, accessToken, expiresAt: Date.now() + 8 * 3600 * 1000 },
    })

    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   8 * 3600,
    })
    res.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   30 * 24 * 3600,
    })

    return res
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Logged out' })
  res.cookies.delete('accessToken')
  res.cookies.delete('refreshToken')
  return res
}
