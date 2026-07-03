import * as jose from 'jose'
import type { User } from '@/types'

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-in-prod'
)
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-change-in-prod'
)

export async function signAccessToken(user: User): Promise<string> {
  return new jose.SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(ACCESS_SECRET)
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(REFRESH_SECRET)
}

export async function verifyAccessToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jose.jwtVerify(token, ACCESS_SECRET)
    return payload.user as User
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jose.jwtVerify(token, REFRESH_SECRET)
    return payload.userId as string
  } catch {
    return null
  }
}