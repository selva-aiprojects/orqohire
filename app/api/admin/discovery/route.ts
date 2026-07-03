import { NextRequest, NextResponse } from 'next/server'
import { getDiscoveryQueue, approveKeyword, rejectKeyword } from '@/lib/matching/discovery'

export async function GET() {
  try {
    const data = await getDiscoveryQueue()
    return NextResponse.json({ success:true, data })
  } catch(e:any) {
    return NextResponse.json({ success:false, error:e.message }, { status:500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, id } = await req.json()
    if (action==='approve') await approveKeyword(id, 'admin')
    else if (action==='reject') await rejectKeyword(id, 'admin')
    return NextResponse.json({ success:true })
  } catch(e:any) {
    return NextResponse.json({ success:false, error:e.message }, { status:500 })
  }
}