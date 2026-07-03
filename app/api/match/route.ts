import { NextRequest, NextResponse } from 'next/server'
import { getAllCandidates, getCandidateById } from '@/lib/sheets/candidates'
import { getRequirementByCode } from '@/lib/sheets/requirements'
import { shortlistCandidates, computeMatch } from '@/lib/matching/engine'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const jobCode     = searchParams.get('jobCode')
    const candidateId = searchParams.get('candidateId')
    const limit       = parseInt(searchParams.get('limit') ?? '20')

    if (!jobCode) {
      return NextResponse.json(
        { success: false, error: 'jobCode is required' },
        { status: 400 }
      )
    }

    const requirement = await getRequirementByCode(jobCode)
    if (!requirement) {
      return NextResponse.json(
        { success: false, error: 'Requirement not found' },
        { status: 404 }
      )
    }
    if (requirement.status !== 'Active') {
      return NextResponse.json(
        { success: false, error: 'Requirement is not Active' },
        { status: 400 }
      )
    }

    if (candidateId) {
      const candidate = await getCandidateById(candidateId)
      if (!candidate) {
        return NextResponse.json(
          { success: false, error: 'Candidate not found' },
          { status: 404 }
        )
      }
      const score = computeMatch(candidate, requirement)
      return NextResponse.json({ success: true, data: score })
    }

    const candidates = await getAllCandidates()
    const shortlist  = shortlistCandidates(candidates, requirement, undefined, limit)

    // Attach candidate names to scores
    const candMap = new Map(candidates.map(c => [c.id, c]))
    const enriched = shortlist.map(s => ({
      ...s,
      candidateName: candMap.get(s.candidateId)?.fullName || s.candidateId,
      designation:   candMap.get(s.candidateId)?.currentDesignation || '',
      location:      candMap.get(s.candidateId)?.locationCurrent || '',
    }))

    return NextResponse.json({
      success: true,
      data:    enriched,
      total:   enriched.length,
    })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    )
  }
}