import { query, queryOne, execute } from '@/lib/db/pool'
import { normalizeSkill, normalizeTitle } from './normalizer'
import { classifyRole } from './taxonomy'

export type DiscoveryStatus = 'new' | 'review' | 'approved' | 'rejected'

export interface DiscoveredKeyword {
  id:          string
  type:        'skill' | 'title' | 'tool' | 'industry'
  rawValue:    string
  normalized:  string
  occurrences: number
  status:      DiscoveryStatus
  seenIn:      string[]
  firstSeen:   string
  lastSeen:    string
  reviewedBy?: string
}

function rowToKeyword(row: any): DiscoveredKeyword {
  return {
    id:          row.id,
    type:        row.type,
    rawValue:    row.raw_value,
    normalized:  row.normalized || '',
    occurrences: row.occurrences || 0,
    status:      row.status || 'new',
    seenIn:      [],
    firstSeen:   row.first_seen_at ? new Date(row.first_seen_at).toISOString() : '',
    lastSeen:    row.last_seen_at ? new Date(row.last_seen_at).toISOString() : '',
    reviewedBy:  row.reviewed_by || undefined,
  }
}

export async function discoverFromJD(
  skills: string[],
  title: string,
  jobCode: string
): Promise<{ newSkills: string[]; newTitles: string[] }> {
  const newSkills: string[] = []
  const newTitles: string[] = []

  const titleNode = classifyRole(title)
  if (!titleNode && title) {
    await queueKeyword('title', title, jobCode)
    newTitles.push(title)
  }

  for (const skill of skills) {
    const normalized = normalizeSkill(skill)
    if (normalized === skill.toLowerCase().replace(/[\s\/\-\.]+/g, '_') && skill.length > 2) {
      const commonWords = ['with','and','or','the','for','in','on','at','to','of','a','an']
      if (!commonWords.includes(skill.toLowerCase())) {
        await queueKeyword('skill', skill, jobCode)
        newSkills.push(skill)
      }
    }
  }

  return { newSkills, newTitles }
}

async function queueKeyword(
  type: DiscoveredKeyword['type'],
  rawValue: string,
  jobCode: string
): Promise<void> {
  try {
    const existing = await queryOne<any>(
      `SELECT * FROM discovered_keywords WHERE LOWER(raw_value) = LOWER($1) AND type = $2`,
      [rawValue, type]
    )
    const now = new Date().toISOString()

    if (existing) {
      const occurrences = (existing.occurrences || 0) + 1
      let status = existing.status as DiscoveryStatus
      if (occurrences >= 200 && status === 'review') status = 'approved'
      else if (occurrences >= 50 && status === 'new') status = 'review'

      await execute(
        `UPDATE discovered_keywords SET occurrences = $1, status = $2, last_seen_at = $3 WHERE id = $4`,
        [occurrences, status, now, existing.id]
      )
    } else {
      const id = crypto.randomUUID()
      const normalized = type === 'skill' ? normalizeSkill(rawValue) : normalizeTitle(rawValue)
      await execute(
        `INSERT INTO discovered_keywords (id, type, raw_value, normalized, occurrences, status, first_seen_at, last_seen_at)
         VALUES ($1, $2, $3, $4, 1, 'new', $5, $5)`,
        [id, type, rawValue, normalized, now]
      )
    }
  } catch {
    // non-blocking
  }
}

export async function getDiscoveryQueue(status?: DiscoveryStatus): Promise<DiscoveredKeyword[]> {
  try {
    let sql = 'SELECT * FROM discovered_keywords'
    const params: any[] = []
    if (status) {
      sql += ' WHERE status = $1'
      params.push(status)
    }
    sql += ' ORDER BY last_seen_at DESC'
    const rows = await query<any>(sql, params)
    return rows.map(rowToKeyword)
  } catch {
    return []
  }
}

export async function approveKeyword(id: string, reviewedBy: string): Promise<void> {
  await execute(
    `UPDATE discovered_keywords SET status = 'approved', reviewed_by = $1 WHERE id = $2`,
    [reviewedBy, id]
  )
}

export async function rejectKeyword(id: string, reviewedBy: string): Promise<void> {
  await execute(
    `UPDATE discovered_keywords SET status = 'rejected', reviewed_by = $1 WHERE id = $2`,
    [reviewedBy, id]
  )
}

export function getAutoPromotionStatus(occurrences: number): DiscoveryStatus {
  if (occurrences < 10)  return 'new'
  if (occurrences < 50)  return 'review'
  if (occurrences < 200) return 'review'
  return 'approved'
}
