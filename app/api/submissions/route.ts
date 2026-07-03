import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db/pool'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const client  = searchParams.get('client')
    const jobCode = searchParams.get('jobCode')

    let sql = 'SELECT * FROM pipeline_entries'
    const params: any[] = []
    const conditions: string[] = []

    if (client) {
      conditions.push(`client_name = $${params.length + 1}`)
      params.push(client)
    }
    if (jobCode) {
      conditions.push(`job_code = $${params.length + 1}`)
      params.push(jobCode)
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }
    sql += ' ORDER BY submitted_at DESC'

    const rows = await query<any>(sql, params)
    const entries = rows.map(r => ({
      id: r.id, jobCode: r.job_code, candidateId: r.candidate_id,
      candidateName: r.candidate_name, clientName: r.client_name,
      submissionDate: r.submitted_at ? new Date(r.submitted_at).toISOString() : '',
      currentStage: r.current_stage || 'Submitted',
      l1Date: r.l1_date ? new Date(r.l1_date).toISOString() : undefined,
      l1Result: r.l1_result,
      l2Date: r.l2_date ? new Date(r.l2_date).toISOString() : undefined,
      l2Result: r.l2_result,
      offerDate: r.offer_date ? new Date(r.offer_date).toISOString() : undefined,
      ctcOffered: r.ctc_offered_lpa,
      joiningDate: r.joining_date,
      dropoutReason: r.dropout_reason,
      assignedRecruiter: r.assigned_recruiter,
    }))

    return NextResponse.json({ success: true, data: entries, total: entries.length })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { jobCode, candidateId, candidateName, clientName } = await req.json()
    if (!jobCode || !candidateId || !clientName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await queryOne<any>(
      'SELECT 1 FROM pipeline_entries WHERE job_code = $1 AND candidate_id = $2 LIMIT 1',
      [jobCode, candidateId]
    )
    if (existing) {
      return NextResponse.json(
        { success: false, error: `${candidateName} already submitted for ${jobCode}` },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await execute(
      `INSERT INTO pipeline_entries (id, job_code, candidate_id, candidate_name, client_name,
        submitted_at, current_stage, assigned_recruiter, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'Submitted', 'Admin', $6, $6)`,
      [id, jobCode, candidateId, candidateName, clientName, now]
    )

    return NextResponse.json({
      success: true,
      data: { id, jobCode, candidateId, candidateName, clientName, submissionDate: now, currentStage: 'Submitted' }
    }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { entryId, newStage, stageData } = await req.json()

    const sets: string[] = ['current_stage = $1']
    const vals: any[] = [newStage]
    let idx = 2

    if (stageData?.l1Date) { sets.push(`l1_date = $${idx}`); vals.push(stageData.l1Date); idx++ }
    if (stageData?.l1Result) { sets.push(`l1_result = $${idx}`); vals.push(stageData.l1Result); idx++ }
    if (stageData?.l2Date) { sets.push(`l2_date = $${idx}`); vals.push(stageData.l2Date); idx++ }
    if (stageData?.l2Result) { sets.push(`l2_result = $${idx}`); vals.push(stageData.l2Result); idx++ }
    if (stageData?.offerDate) { sets.push(`offer_date = $${idx}`); vals.push(stageData.offerDate); idx++ }
    if (stageData?.ctcOffered) { sets.push(`ctc_offered_lpa = $${idx}`); vals.push(stageData.ctcOffered); idx++ }
    if (stageData?.joiningDate) { sets.push(`joining_date = $${idx}`); vals.push(stageData.joiningDate); idx++ }
    if (stageData?.dropoutReason) { sets.push(`dropout_reason = $${idx}`); vals.push(stageData.dropoutReason); idx++ }

    sets.push(`updated_at = NOW()`)
    vals.push(entryId)

    const count = await execute(
      `UPDATE pipeline_entries SET ${sets.join(', ')} WHERE id = $${idx}`,
      vals
    )
    if (count === 0) {
      return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { id: entryId, currentStage: newStage } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}
