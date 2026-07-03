import { query, queryOne, execute } from '@/lib/db/pool'
import { writeAuditLog } from './client'
import type { Requirement, RequirementStatus } from '@/types'

function rowToReq(row: any): Requirement {
  return {
    jobCode:          row.job_code || '',
    clientName:       row.client_name || '',
    designation:      row.designation || '',
    department:       row.department || '',
    jobDescription:   row.job_description || '',
    requiredSkills:   row.required_skills || [],
    goodToHaveSkills: row.good_to_have_skills || [],
    minExperience:    row.min_experience || 0,
    maxExperience:    row.max_experience || undefined,
    location:         row.location || '',
    employmentType:   row.employment_type || 'Full-time',
    budgetMin:        parseFloat(row.budget_min_lpa) || 0,
    budgetMax:        parseFloat(row.budget_max_lpa) || 0,
    noticePeriodMax:  row.notice_period_max_days ?? 30,
    vacancies:        row.vacancies ?? 1,
    priority:         row.priority || 'Medium',
    status:           row.status || 'Active',
    accountManager:   row.account_manager || '',
    clientSpoc:       row.client_spoc || '',
    raisedOn:         row.raised_at ? new Date(row.raised_at).toISOString() : '',
    activatedOn:      row.activated_at ? new Date(row.activated_at).toISOString() : '',
    closedOn:         row.closed_at ? new Date(row.closed_at).toISOString() : '',
    filledCount:      row.filled_count || 0,
  }
}

export async function getAllRequirements(): Promise<Requirement[]> {
  const rows = await query<any>('SELECT * FROM requirements ORDER BY created_at DESC')
  return rows.map(rowToReq)
}

export async function getActiveRequirements(): Promise<Requirement[]> {
  const rows = await query<any>("SELECT * FROM requirements WHERE status = 'Active' ORDER BY created_at DESC")
  return rows.map(rowToReq)
}

export async function getRequirementByCode(code: string): Promise<Requirement | null> {
  const row = await queryOne<any>('SELECT * FROM requirements WHERE job_code = $1', [code])
  return row ? rowToReq(row) : null
}

export async function getRequirementsByClient(clientName: string): Promise<Requirement[]> {
  const rows = await query<any>('SELECT * FROM requirements WHERE client_name = $1 ORDER BY created_at DESC', [clientName])
  return rows.map(rowToReq)
}

export async function createRequirement(
  data: Omit<Requirement, 'jobCode' | 'raisedOn' | 'filledCount'>,
  userId: string
): Promise<Requirement> {
  const { rows } = await (await import('@/lib/db/pool')).getPool().query("SELECT COUNT(*) as cnt FROM requirements")
  const seq = String(parseInt(rows[0].cnt) + 1).padStart(3, '0')
  const jobCode = `WK${seq}`
  const now = new Date().toISOString()
  await query(
    `INSERT INTO requirements (job_code, client_name, designation, department, job_description,
      required_skills, good_to_have_skills, min_experience, max_experience, location,
      employment_type, budget_min_lpa, budget_max_lpa, notice_period_max_days, vacancies,
      priority, status, account_manager, client_spoc, raised_at, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
    [jobCode, data.clientName, data.designation, data.department, data.jobDescription,
     JSON.stringify(data.requiredSkills), JSON.stringify(data.goodToHaveSkills),
     data.minExperience, data.maxExperience, data.location, data.employmentType,
     data.budgetMin, data.budgetMax, data.noticePeriodMax, data.vacancies,
     data.priority, data.status, data.accountManager, data.clientSpoc,
     now, now, now]
  )
  const req: Requirement = { ...data, jobCode, raisedOn: now, filledCount: 0 }
  await writeAuditLog('CREATE', 'Requirement', jobCode, userId, data.designation)
  return req
}

export async function updateRequirement(
  code: string,
  updates: Partial<Requirement>,
  userId: string
): Promise<Requirement> {
  const existing = await getRequirementByCode(code)
  if (!existing) throw new Error(`Requirement ${code} not found`)
  const now = new Date().toISOString()

  const sets: string[] = []
  const vals: any[] = []
  let idx = 1

  if (updates.clientName !== undefined) { sets.push(`client_name = $${idx++}`); vals.push(updates.clientName) }
  if (updates.designation !== undefined) { sets.push(`designation = $${idx++}`); vals.push(updates.designation) }
  if (updates.department !== undefined) { sets.push(`department = $${idx++}`); vals.push(updates.department) }
  if (updates.jobDescription !== undefined) { sets.push(`job_description = $${idx++}`); vals.push(updates.jobDescription) }
  if (updates.requiredSkills !== undefined) { sets.push(`required_skills = $${idx++}`); vals.push(JSON.stringify(updates.requiredSkills)) }
  if (updates.goodToHaveSkills !== undefined) { sets.push(`good_to_have_skills = $${idx++}`); vals.push(JSON.stringify(updates.goodToHaveSkills)) }
  if (updates.minExperience !== undefined) { sets.push(`min_experience = $${idx++}`); vals.push(updates.minExperience) }
  if (updates.maxExperience !== undefined) { sets.push(`max_experience = $${idx++}`); vals.push(updates.maxExperience) }
  if (updates.location !== undefined) { sets.push(`location = $${idx++}`); vals.push(updates.location) }
  if (updates.employmentType !== undefined) { sets.push(`employment_type = $${idx++}`); vals.push(updates.employmentType) }
  if (updates.budgetMin !== undefined) { sets.push(`budget_min_lpa = $${idx++}`); vals.push(updates.budgetMin) }
  if (updates.budgetMax !== undefined) { sets.push(`budget_max_lpa = $${idx++}`); vals.push(updates.budgetMax) }
  if (updates.noticePeriodMax !== undefined) { sets.push(`notice_period_max_days = $${idx++}`); vals.push(updates.noticePeriodMax) }
  if (updates.vacancies !== undefined) { sets.push(`vacancies = $${idx++}`); vals.push(updates.vacancies) }
  if (updates.priority !== undefined) { sets.push(`priority = $${idx++}`); vals.push(updates.priority) }
  if (updates.status !== undefined) { sets.push(`status = $${idx++}`); vals.push(updates.status) }
  if (updates.filledCount !== undefined) { sets.push(`filled_count = $${idx++}`); vals.push(updates.filledCount) }
  if (updates.accountManager !== undefined) { sets.push(`account_manager = $${idx++}`); vals.push(updates.accountManager) }
  if (updates.clientSpoc !== undefined) { sets.push(`client_spoc = $${idx++}`); vals.push(updates.clientSpoc) }
  if (updates.status === 'Closed') { sets.push(`closed_at = $${idx++}`); vals.push(now) }
  if (updates.status === 'Active') { sets.push(`activated_at = $${idx++}`); vals.push(now) }
  sets.push(`updated_at = $${idx++}`); vals.push(now)
  vals.push(code)

  if (sets.length > 1) {
    await execute(`UPDATE requirements SET ${sets.join(', ')} WHERE job_code = $${idx}`, vals)
  }

  await writeAuditLog('UPDATE', 'Requirement', code, userId, Object.keys(updates).join(', '))
  return { ...existing, ...updates }
}
