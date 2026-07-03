import { query, queryOne, execute } from '@/lib/db/pool'
import { writeAuditLog } from './client'
import type { Candidate, CandidateStatus } from '@/types'

function rowToCandidate(row: any): Candidate {
  return {
    id:                 row.id,
    fullName:           row.full_name || '',
    email:              row.email || '',
    phone:              row.phone || '',
    currentDesignation: row.current_designation || '',
    currentCompany:     row.current_company || '',
    totalExperience:    parseFloat(row.total_experience_years) || 0,
    relevantExperience: parseFloat(row.relevant_experience_years) || 0,
    primarySkills:      row.primary_skills || [],
    secondarySkills:    row.secondary_skills || [],
    resumeLink:         row.resume_link || '',
    locationCurrent:    row.location_current || '',
    locationPreferred:  row.location_preferred || [],
    openToRelocate:     row.open_to_relocate || 'Negotiable',
    noticePeriodText:   row.notice_period_text || '',
    noticePeriodDays:   row.notice_period_days || 0,
    employmentType:     row.employment_type || 'Full-time',
    currentCTC:         parseFloat(row.current_ctc_lpa) || 0,
    expectedCTC:        parseFloat(row.expected_ctc_lpa) || 0,
    availabilityDate:   row.availability_date || '',
    source:             row.source || 'Portal',
    status:             row.status || 'Active',
    registeredOn:       row.registered_at ? new Date(row.registered_at).toISOString() : '',
    lastUpdated:        row.updated_at ? new Date(row.updated_at).toISOString() : '',
  }
}

export async function getAllCandidates(): Promise<Candidate[]> {
  const rows = await query<any>('SELECT * FROM candidates ORDER BY registered_at DESC')
  return rows.map(rowToCandidate)
}

export async function getCandidateById(id: string): Promise<Candidate | null> {
  const row = await queryOne<any>('SELECT * FROM candidates WHERE id = $1', [id])
  return row ? rowToCandidate(row) : null
}

export async function getCandidateByEmail(email: string): Promise<Candidate | null> {
  const row = await queryOne<any>('SELECT * FROM candidates WHERE LOWER(email) = LOWER($1)', [email])
  return row ? rowToCandidate(row) : null
}

export interface CandidateFilter {
  search?: string
  skills?: string[]
  minExp?: number
  maxExp?: number
  location?: string[]
  noticePeriodMax?: number
  employmentType?: string
  status?: CandidateStatus
}

export async function searchCandidates(filter: CandidateFilter): Promise<Candidate[]> {
  const all = await getAllCandidates()
  return all.filter(c => {
    if (filter.search) {
      const q = filter.search.toLowerCase()
      const hit = c.fullName.toLowerCase().includes(q) ||
                  c.email.toLowerCase().includes(q) ||
                  c.currentDesignation.toLowerCase().includes(q) ||
                  c.currentCompany.toLowerCase().includes(q)
      if (!hit) return false
    }
    if (filter.skills?.length) {
      const allSkills = [...c.primarySkills, ...c.secondarySkills].map(s=>s.toLowerCase())
      const hit = filter.skills.some(sk => allSkills.some(cs => cs.includes(sk.toLowerCase())))
      if (!hit) return false
    }
    if (filter.minExp !== undefined && c.totalExperience < filter.minExp) return false
    if (filter.maxExp !== undefined && c.totalExperience > filter.maxExp) return false
    if (filter.noticePeriodMax !== undefined && c.noticePeriodDays > filter.noticePeriodMax) return false
    if (filter.employmentType && c.employmentType !== filter.employmentType) return false
    if (filter.location?.length) {
      const hit = filter.location.some(l =>
        c.locationCurrent.toLowerCase().includes(l.toLowerCase()) ||
        c.locationPreferred.some(p => p.toLowerCase().includes(l.toLowerCase()))
      )
      if (!hit) return false
    }
    return true
  })
}

export async function createCandidate(
  data: Omit<Candidate, 'id' | 'registeredOn' | 'lastUpdated'>
): Promise<Candidate> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  await query(
    `INSERT INTO candidates (id, full_name, email, phone, current_designation, current_company,
      total_experience_years, relevant_experience_years, primary_skills, secondary_skills,
      resume_link, location_current, location_preferred, open_to_relocate, notice_period_text,
      notice_period_days, employment_type, current_ctc_lpa, expected_ctc_lpa, source, status,
      registered_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
    [id, data.fullName, data.email, data.phone, data.currentDesignation, data.currentCompany,
     data.totalExperience, data.relevantExperience,
     JSON.stringify(data.primarySkills), JSON.stringify(data.secondarySkills),
     data.resumeLink, data.locationCurrent, JSON.stringify(data.locationPreferred),
     data.openToRelocate, data.noticePeriodText, data.noticePeriodDays,
     data.employmentType, data.currentCTC, data.expectedCTC,
     data.source, data.status, now, now]
  )
  const candidate: Candidate = { ...data, id, registeredOn: now, lastUpdated: now }
  await writeAuditLog('CREATE', 'Candidate', id, data.source, data.fullName)
  return candidate
}

export async function updateCandidate(
  id: string,
  updates: Partial<Candidate>,
  userId: string
): Promise<Candidate> {
  const existing = await getCandidateById(id)
  if (!existing) throw new Error(`Candidate ${id} not found`)
  const now = new Date().toISOString()

  const sets: string[] = []
  const vals: any[] = []
  let idx = 1

  if (updates.fullName !== undefined) { sets.push(`full_name = $${idx++}`); vals.push(updates.fullName) }
  if (updates.email !== undefined) { sets.push(`email = $${idx++}`); vals.push(updates.email) }
  if (updates.phone !== undefined) { sets.push(`phone = $${idx++}`); vals.push(updates.phone) }
  if (updates.currentDesignation !== undefined) { sets.push(`current_designation = $${idx++}`); vals.push(updates.currentDesignation) }
  if (updates.currentCompany !== undefined) { sets.push(`current_company = $${idx++}`); vals.push(updates.currentCompany) }
  if (updates.totalExperience !== undefined) { sets.push(`total_experience_years = $${idx++}`); vals.push(updates.totalExperience) }
  if (updates.relevantExperience !== undefined) { sets.push(`relevant_experience_years = $${idx++}`); vals.push(updates.relevantExperience) }
  if (updates.primarySkills !== undefined) { sets.push(`primary_skills = $${idx++}`); vals.push(JSON.stringify(updates.primarySkills)) }
  if (updates.secondarySkills !== undefined) { sets.push(`secondary_skills = $${idx++}`); vals.push(JSON.stringify(updates.secondarySkills)) }
  if (updates.resumeLink !== undefined) { sets.push(`resume_link = $${idx++}`); vals.push(updates.resumeLink) }
  if (updates.locationCurrent !== undefined) { sets.push(`location_current = $${idx++}`); vals.push(updates.locationCurrent) }
  if (updates.locationPreferred !== undefined) { sets.push(`location_preferred = $${idx++}`); vals.push(JSON.stringify(updates.locationPreferred)) }
  if (updates.openToRelocate !== undefined) { sets.push(`open_to_relocate = $${idx++}`); vals.push(updates.openToRelocate) }
  if (updates.noticePeriodText !== undefined) { sets.push(`notice_period_text = $${idx++}`); vals.push(updates.noticePeriodText) }
  if (updates.noticePeriodDays !== undefined) { sets.push(`notice_period_days = $${idx++}`); vals.push(updates.noticePeriodDays) }
  if (updates.employmentType !== undefined) { sets.push(`employment_type = $${idx++}`); vals.push(updates.employmentType) }
  if (updates.currentCTC !== undefined) { sets.push(`current_ctc_lpa = $${idx++}`); vals.push(updates.currentCTC) }
  if (updates.expectedCTC !== undefined) { sets.push(`expected_ctc_lpa = $${idx++}`); vals.push(updates.expectedCTC) }
  if (updates.source !== undefined) { sets.push(`source = $${idx++}`); vals.push(updates.source) }
  if (updates.status !== undefined) { sets.push(`status = $${idx++}`); vals.push(updates.status) }
  sets.push(`updated_at = $${idx++}`); vals.push(now)
  vals.push(id)

  if (sets.length > 1) {
    await execute(`UPDATE candidates SET ${sets.join(', ')} WHERE id = $${idx}`, vals)
  }

  await writeAuditLog('UPDATE', 'Candidate', id, userId, Object.keys(updates).join(', '))
  return { ...existing, ...updates, lastUpdated: now }
}
