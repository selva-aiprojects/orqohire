import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query, execute } from '@/lib/db/pool'
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'

async function emailExists(email: string): Promise<boolean> {
  const rows = await query<any>(
    'SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [email]
  )
  return rows.length > 0
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password)
      return NextResponse.json({ success:false, error:'All fields required' }, { status:400 })
    if (password.length < 6)
      return NextResponse.json({ success:false, error:'Password must be at least 6 characters' }, { status:400 })
    if (await emailExists(email))
      return NextResponse.json({ success:false, error:'Email already registered' }, { status:400 })

    const hash = await bcrypt.hash(password, 10)
    const id   = crypto.randomUUID()
    const now  = new Date().toISOString()

    await execute(
      `INSERT INTO users (id, email, password_hash, name, role, created_at)
       VALUES ($1, $2, $3, $4, 'candidate', $5)`,
      [id, email, hash, name, now]
    )

    const user = { id, email, name, role: 'candidate' as any, createdAt: now }
    const accessToken  = await signAccessToken(user)
    const refreshToken = await signRefreshToken(id)

    try {
      await sendWelcomeEmail(email, name, password)
    } catch { /* non-blocking */ }

    const res = NextResponse.json({ success:true, data:{ user, accessToken } }, { status:201 })
    res.cookies.set('accessToken', accessToken, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', maxAge:8*3600 })
    res.cookies.set('refreshToken', refreshToken, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', maxAge:30*24*3600 })
    return res
  } catch (e:any) {
    return NextResponse.json({ success:false, error:e.message }, { status:500 })
  }
}

async function sendWelcomeEmail(to: string, name: string, password: string) {
  const subject    = 'Welcome to OrqoHire — Your Login Details'
  const body       = `Hi ${name},\n\nWelcome to OrqoHire!\n\nYour login details:\nEmail: ${to}\nPassword: ${password}\n\nLogin at: https://orqohire.vercel.app/login\n\nBest regards,\nOrqoHire Team`
  console.log(`[EMAIL] To: ${to} | Subject: ${subject} | Body: ${body}`)
}
