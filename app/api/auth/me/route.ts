import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('accessToken')?.value
  if (!token) return NextResponse.json({ success:false, error:'Not authenticated' }, { status:401 })
  const user = await verifyAccessToken(token)
  if (!user) return NextResponse.json({ success:false, error:'Invalid token' }, { status:401 })
  return NextResponse.json({ success:true, data:user })
}