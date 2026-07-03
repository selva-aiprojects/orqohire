import { query, queryOne, execute } from '@/lib/db/pool'

// ── Passport ─────────────────────────────────────────────────────────────────
export async function getPassport(candidateId: string) {
  const row = await queryOne<any>('SELECT * FROM passports WHERE candidate_id = $1', [candidateId])
  if (!row) return null
  return {
    candidateId:       row.candidate_id,
    completionPercent: row.completion_percent ?? 0,
    trustScore:        row.trust_score ?? 0,
    passportStatus:    row.status || 'DRAFT',
    fullName:          row.full_name || '',
    email:             row.email || '',
    phone:             row.phone || '',
    currentRole:       row.current_role || '',
    totalExperience:   row.total_experience || '',
    skills:            row.skills || '',
    location:          row.location || '',
    noticePeriod:      row.notice_period || '',
    linkedinUrl:       row.linkedin_url || '',
    resumeLink:        row.resume_link || '',
    consentGiven:      row.consent_given || false,
    createdAt:         row.created_at ? new Date(row.created_at).toISOString() : '',
    updatedAt:         row.updated_at ? new Date(row.updated_at).toISOString() : '',
  }
}

export async function upsertPassport(candidateId: string, data: Record<string, any>) {
  const now = new Date().toISOString()

  const fields = [data.fullName, data.email, data.phone, data.currentRole,
    data.totalExperience, data.skills, data.location, data.resumeLink]
  const filled = fields.filter(Boolean).length
  const completionPercent = Math.round((filled / fields.length) * 100)

  const employment = await getEmploymentHistory(candidateId)
  const verified   = employment.filter(e => e.verificationStatus === 'VERIFIED').length
  const trustScore = Math.min(100, completionPercent + (verified * 10))
  const passportStatus = trustScore >= 80 ? 'COMPLETE' : completionPercent >= 50 ? 'PARTIAL' : 'DRAFT'

  await execute(
    `INSERT INTO passports (candidate_id, status, trust_score, completion_percent,
      full_name, email, phone, current_role, total_experience, skills,
      location, notice_period, linkedin_url, resume_link, consent_given, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     ON CONFLICT (candidate_id) DO UPDATE SET
      status = $2, trust_score = $3, completion_percent = $4,
      full_name = $5, email = $6, phone = $7, current_role = $8,
      total_experience = $9, skills = $10, location = $11, notice_period = $12,
      linkedin_url = $13, resume_link = $14, consent_given = $15, updated_at = $17`,
    [candidateId, passportStatus, trustScore, completionPercent,
     data.fullName||'', data.email||'', data.phone||'', data.currentRole||'',
     data.totalExperience||'', data.skills||'', data.location||'',
     data.noticePeriod||'', data.linkedinUrl||'', data.resumeLink||'',
     data.consentGiven||false, now, now]
  )

  return { completionPercent, trustScore, passportStatus }
}

// ── Employment ────────────────────────────────────────────────────────────────
export async function getEmploymentHistory(candidateId: string) {
  const rows = await query<any>(
    `SELECT eh.* FROM employment_histories eh
     JOIN passports p ON p.id = eh.passport_id
     WHERE p.candidate_id = $1
     ORDER BY eh.start_date DESC NULLS LAST`,
    [candidateId]
  )
  return rows.map(r => ({
    id:                 r.id,
    candidateId:        candidateId,
    companyName:        r.company_name,
    designation:        r.designation,
    employmentType:     r.employment_type,
    startDate:          r.start_date,
    endDate:            r.end_date,
    officialEmail:      r.official_email,
    isCurrent:          r.is_current || false,
    verificationStatus: r.verification_status || 'NOT_REQUESTED',
    verifiedAt:         r.verified_at ? new Date(r.verified_at).toISOString() : '',
    createdAt:          r.created_at ? new Date(r.created_at).toISOString() : '',
  }))
}

export async function addEmployment(candidateId: string, data: Record<string, any>) {
  const passport = await queryOne<any>('SELECT id FROM passports WHERE candidate_id = $1', [candidateId])
  let passportId: string
  if (!passport) {
    passportId = crypto.randomUUID()
    await execute(
      `INSERT INTO passports (id, candidate_id, status, created_at, updated_at)
       VALUES ($1, $2, 'DRAFT', NOW(), NOW())`,
      [passportId, candidateId]
    )
  } else {
    passportId = passport.id
  }

  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  await execute(
    `INSERT INTO employment_histories (id, passport_id, company_name, designation,
      employment_type, start_date, end_date, official_email, is_current,
      verification_status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'NOT_REQUESTED',$10)`,
    [id, passportId, data.companyName, data.designation,
     data.employmentType, data.startDate, data.endDate||null,
     data.officialEmail||null, data.isCurrent||false, now]
  )
  return id
}

export async function updateEmploymentVerification(empId: string, status: string, verifiedAt: string) {
  await execute(
    `UPDATE employment_histories SET verification_status = $1, verified_at = $2 WHERE id = $3`,
    [status, verifiedAt, empId]
  )
}

// ── Verification Requests ─────────────────────────────────────────────────────
export async function createVerificationRequest(candidateId: string, empId: string, employerEmail: string) {
  const id = crypto.randomUUID()
  const token = `VRF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const now = new Date().toISOString()
  const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()

  await execute(
    `INSERT INTO verification_requests (id, employment_id, candidate_id, employer_email,
      token, sent_at, expires_at, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'PENDING',$8)`,
    [id, empId, candidateId, employerEmail, token, now, expires, now]
  )
  return { id, token }
}

export async function getVerificationByToken(token: string) {
  const row = await queryOne<any>('SELECT * FROM verification_requests WHERE token = $1', [token])
  if (!row) return null
  return {
    id: row.id, candidateId: row.candidate_id, employmentId: row.employment_id,
    employerEmail: row.employer_email, token: row.token, sentAt: row.sent_at,
    expiresAt: row.expires_at, status: row.status, decision: row.decision,
    verifiedBy: row.verified_by, verifiedAt: row.verified_at,
  }
}

export async function resolveVerification(token: string, decision: 'CONFIRM' | 'REJECT', verifiedBy: string) {
  const row = await queryOne<any>('SELECT * FROM verification_requests WHERE token = $1', [token])
  if (!row) return null
  const now = new Date().toISOString()

  await execute(
    `UPDATE verification_requests SET status = 'RESOLVED', decision = $1, verified_by = $2, verified_at = $3
     WHERE token = $4`,
    [decision, verifiedBy, now, token]
  )

  const newStatus = decision === 'CONFIRM' ? 'VERIFIED' : 'REJECTED'
  await updateEmploymentVerification(row.employment_id, newStatus, now)
  return { ...row, status: 'RESOLVED', decision, verified_by: verifiedBy, verified_at: now }
}

// ── Candidate Accounts ────────────────────────────────────────────────────────
export async function getCandidateAccount(email: string) {
  const row = await queryOne<any>('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email])
  if (!row) return null
  return {
    id: row.id, email: row.email, passwordHash: row.password_hash,
    name: row.name, candidateId: row.id, status: 'ACTIVE', createdAt: row.created_at,
  }
}

export async function createCandidateAccount(email: string, passwordHash: string, name: string) {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  await execute(
    `INSERT INTO users (id, email, password_hash, name, role, created_at)
     VALUES ($1, $2, $3, $4, 'candidate', $5)`,
    [id, email, passwordHash, name, now]
  )
  return { id, email, name, candidateId: id }
}
