import { NextRequest, NextResponse } from 'next/server'
import { getAllRequirements, getActiveRequirements, getRequirementsByClient } from '@/lib/sheets/requirements'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const client = searchParams.get('client')

    let requirements
    if (status === 'Active') {
      requirements = await getActiveRequirements()
    } else if (client) {
      requirements = await getRequirementsByClient(client)
    } else {
      requirements = await getAllRequirements()
    }

    return NextResponse.json({
      success: true,
      data: requirements,
      total: requirements.length,
    })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    )
  }
}