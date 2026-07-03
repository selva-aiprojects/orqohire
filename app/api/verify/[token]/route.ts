import { NextRequest, NextResponse } from 'next/server'
import { getVerificationByToken, resolveVerification } from '@/lib/passport'

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const request = await getVerificationByToken(params.token)
    if (!request) return NextResponse.json({ success:false, error:'Invalid or expired token' }, { status:404 })
    if (request.status === 'RESOLVED') return NextResponse.json({ success:false, error:'Already resolved' }, { status:400 })
    if (new Date(request.expiresAt) < new Date()) return NextResponse.json({ success:false, error:'Token expired' }, { status:400 })
    return NextResponse.json({ success:true, data:request })
  } catch (e:any) {
    return NextResponse.json({ success:false, error:e.message }, { status:500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { decision, verifiedBy } = await req.json()
    if (!['CONFIRM','REJECT'].includes(decision)) return NextResponse.json({ success:false, error:'Invalid decision' }, { status:400 })
    const result = await resolveVerification(params.token, decision, verifiedBy||'Employer')
    return NextResponse.json({ success:true, data:result })
  } catch (e:any) {
    return NextResponse.json({ success:false, error:e.message }, { status:500 })
  }
}