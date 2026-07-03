import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/pool'

export async function GET() {
  try {
    const rows = await query<any>(
      'SELECT * FROM passports ORDER BY updated_at DESC'
    )
    const data = rows.map(r => ({
      candidateId:       r.candidate_id,
      completionPercent: r.completion_percent || 0,
      trustScore:        r.trust_score || 0,
      passportStatus:    r.status || 'DRAFT',
      fullName:          r.full_name || '',
      email:             r.email || '',
      updatedAt:         r.updated_at ? new Date(r.updated_at).toISOString() : '',
    }))
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
