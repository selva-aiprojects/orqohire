import { NextRequest, NextResponse } from 'next/server'
import { getAllCandidates, searchCandidates } from '@/lib/sheets/candidates'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filter = {
      search:          searchParams.get('search')          ?? undefined,
      skills:          searchParams.get('skills')?.split(',').map(s=>s.trim()).filter(Boolean),
      minExp:          searchParams.get('minExp')          ? parseFloat(searchParams.get('minExp')!)  : undefined,
      maxExp:          searchParams.get('maxExp')          ? parseFloat(searchParams.get('maxExp')!)  : undefined,
      noticePeriodMax: searchParams.get('noticePeriodMax') ? parseInt(searchParams.get('noticePeriodMax')!) : undefined,
      employmentType:  searchParams.get('employmentType')  ?? undefined,
      location:        searchParams.get('location')?.split(',').map(s=>s.trim()).filter(Boolean),
    }
    const hasFilter = Object.values(filter).some(v => v !== undefined)
    const candidates = hasFilter
      ? await searchCandidates(filter)
      : await getAllCandidates()
    return NextResponse.json({ success: true, data: candidates, total: candidates.length })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { createCandidate } = await import('@/lib/sheets/candidates')
    const body = await req.json()
    const candidate = await createCandidate({ ...body, source: body.source ?? 'Portal' })
    return NextResponse.json({ success: true, data: candidate }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}