import { NextRequest, NextResponse } from 'next/server'
import { ROLE_TAXONOMY, classifyRole, getRoleFamily, getMandatorySkills } from '@/lib/matching/taxonomy'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title  = searchParams.get('title')
    const family = searchParams.get('family')

    if (title) {
      const node = classifyRole(title)
      return NextResponse.json({
        success: true,
        data: {
          classified:      node,
          family:          getRoleFamily(title),
          mandatorySkills: getMandatorySkills(title),
          found:           !!node,
        }
      })
    }

    if (family) {
      const nodes = ROLE_TAXONOMY.filter(r => r.family === family)
      return NextResponse.json({ success:true, data:nodes })
    }

    // Return full taxonomy summary
    const families = [...new Set(ROLE_TAXONOMY.map(r => r.family))]
    const summary  = families.map(f => ({
      family:    f,
      count:     ROLE_TAXONOMY.filter(r => r.family === f).length,
      roles:     ROLE_TAXONOMY.filter(r => r.family === f).map(r => r.role),
      subfamilies: [...new Set(ROLE_TAXONOMY.filter(r=>r.family===f).map(r=>r.subfamily))],
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalRoles: ROLE_TAXONOMY.length,
        families:   summary,
        taxonomy:   ROLE_TAXONOMY,
      }
    })
  } catch (e:any) {
    return NextResponse.json({ success:false, error:e.message }, { status:500 })
  }
}