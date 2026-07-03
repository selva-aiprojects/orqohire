import { NextRequest, NextResponse } from 'next/server'
import { getPassport, upsertPassport, getEmploymentHistory, addEmployment, createVerificationRequest } from '@/lib/passport'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const candidateId = searchParams.get('candidateId')
    if (!candidateId) return NextResponse.json({ success:false, error:'candidateId required' }, { status:400 })
    const [passport, employment] = await Promise.all([
      getPassport(candidateId),
      getEmploymentHistory(candidateId),
    ])
    return NextResponse.json({ success:true, data:{ passport, employment } })
  } catch (e:any) {
    return NextResponse.json({ success:false, error:e.message }, { status:500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, candidateId } = body

    if (action === 'upsert_passport') {
      const result = await upsertPassport(candidateId, body.data)
      return NextResponse.json({ success:true, data:result })
    }

    if (action === 'add_employment') {
      const empId = await addEmployment(candidateId, body.data)
      // Auto-create verification request if official email provided
      if (body.data.officialEmail) {
        const { token } = await createVerificationRequest(candidateId, empId, body.data.officialEmail)
        // In production: send email with verification link
        console.log(`Verification link: /verify/${token}`)
      }
      return NextResponse.json({ success:true, data:{ empId } })
    }

    if (action === 'request_verification') {
      const { token } = await createVerificationRequest(candidateId, body.employmentId, body.employerEmail)
      return NextResponse.json({ success:true, data:{ token, verifyUrl:`/verify/${token}` } })
    }

    return NextResponse.json({ success:false, error:'Unknown action' }, { status:400 })
  } catch (e:any) {
    return NextResponse.json({ success:false, error:e.message }, { status:500 })
  }
}