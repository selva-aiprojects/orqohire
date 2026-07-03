const { Pool } = require('pg')
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

function loadEnv(file) {
  const abs = path.resolve(__dirname, '..', file)
  if (!fs.existsSync(abs)) return
  for (const line of fs.readFileSync(abs, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/)
    if (m) process.env[m[1]] = process.env[m[1]] || m[2]
  }
}
loadEnv('.env.local')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

function parseSkills(text) {
  if (!text) return []
  const items = String(text).split(/[,;\n]+/).flatMap(part =>
    part.trim().split(/\s{2,}/)
  ).map(s => s.trim()).filter(s => s.length > 1)
  return [...new Set(items)]
}

function parseExperience(range) {
  if (!range) return { min: null, max: null }
  const s = String(range).replace(/\s+/g, '').toLowerCase()
  const m = s.match(/(\d+)(?:-|–|to)\s*(\d+)/)
  if (m) return { min: parseInt(m[1]), max: parseInt(m[2]) }
  const p = s.match(/(\d+)\+?/)
  if (p) return { min: parseInt(p[1]), max: null }
  return { min: null, max: null }
}

function parseBudget(text) {
  if (!text) return { min: null, max: null }
  const s = String(text).replace(/,/g, '').toLowerCase()
  const m = s.match(/(\d+(?:\.\d+)?)\s*-?\s*(\d+(?:\.\d+)?)/)
  if (m) return { min: parseFloat(m[1]), max: parseFloat(m[2]) }
  const p = s.match(/(\d+(?:\.\d+)?)/)
  if (p) return { min: null, max: parseFloat(p[1]) }
  return { min: null, max: null }
}

function parseNotice(text) {
  if (text === undefined || text === null || text === '') return { text: null, days: null }
  const s = String(text).trim()
  const d = parseInt(s)
  if (!isNaN(d) && String(d) === s) return { text: `${d} days`, days: d }
  const lower = s.toLowerCase()
  if (lower.includes('immediate')) return { text: 'Immediate', days: 0 }
  if (lower.includes('15') || lower.includes('two week')) return { text: s, days: 15 }
  if (lower.includes('30') || lower.includes('month')) return { text: s, days: 30 }
  if (lower.includes('45')) return { text: s, days: 45 }
  if (lower.includes('60') || lower.includes('two month')) return { text: s, days: 60 }
  if (lower.includes('90') || lower.includes('three month')) return { text: s, days: 90 }
  return { text: s, days: null }
}

async function importCandidates() {
  console.log('\n📋 Importing candidates...')

  // Get existing emails to skip duplicates
  const { rows: existing } = await pool.query('SELECT email FROM candidates')
  const existingEmails = new Set(existing.map(r => r.email?.toLowerCase()).filter(Boolean))

  const wb = XLSX.readFile(path.resolve(__dirname, '../docs/OrqoHire - Candidate(2).xlsx'))
  const ws = wb.Sheets['Candidate']
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

  function buildRow(row) {
    const email = String(row['Email ID'] || '').trim().toLowerCase()
    if (!email || !email.includes('@')) return null
    if (existingEmails.has(email)) return null
    const name = String(row['Candidate name '] || '').trim()
    if (!name) return null
    const notice = parseNotice(row['Notice period'])
    return [
      require('crypto').randomUUID(),
      name, email,
      String(row['Mobile No.'] ?? '').trim().slice(0, 50),
      String(row['Current designation (If fresher or not working mention - NA) '] ?? '').replace(/^NA$/i, '').trim() || null,
      String(row['Current company (If fresher or not working mention - NA) '] ?? '').replace(/^NA$/i, '').trim() || null,
      parseFloat(row['Total experience in the industry (in years)']) || null,
      parseFloat(row['Relevant experience in the applied position (in years)']) || null,
      JSON.stringify(parseSkills(row['Primary skills \n'])),
      JSON.stringify(parseSkills(row['Secondary skills '])),
      String(row['Current location'] ?? '').trim() || null,
      JSON.stringify(
        String(row['Preferred location'] ?? '').split(/[,;]+/).map(s=>s.trim()).filter(Boolean)
      ),
      (notice.text || '').slice(0, 100) || null, notice.days,
      parseFloat(row['Current CTC (in LPA ONLY)']) || null,
      parseFloat(row['Expected CTC (in LPA ONLY)']) || null,
      String(row['Upload resume'] ?? '').trim() || null,
      String(row['Position applied for'] ?? '').trim().slice(0, 100) || null,
    ]
  }

  const allRows = rows.map(buildRow).filter(Boolean)
  console.log(`  Parsed ${rows.length} rows, ${allRows.length} new (${existingEmails.size} already in DB)`)

  const BATCH = 50
  let imported = 0

  for (let i = 0; i < allRows.length; i += BATCH) {
    const batch = allRows.slice(i, i + BATCH)
    const now = new Date().toISOString()

    const placeholders = batch.map((_, j) => {
      const base = j * 21
      return `(${Array.from({length:21}, (_,k)=>'$'+(base+k+1)).join(',')})`
    }).join(',')

    const flat = batch.flatMap(r => [...r, 'Active', now, now])

    await pool.query(`
      INSERT INTO candidates (
        id, full_name, email, phone, current_designation, current_company,
        total_experience_years, relevant_experience_years,
        primary_skills, secondary_skills,
        location_current, location_preferred,
        notice_period_text, notice_period_days,
        current_ctc_lpa, expected_ctc_lpa,
        resume_link, source,
        status, registered_at, updated_at
      ) VALUES ${placeholders}
    `, flat)

    imported += batch.length
    process.stdout.write(`\r  ${imported}/${allRows.length}`)
  }

  console.log(`\n  ✅ ${imported} candidates imported`)
  return imported
}

async function importRequirements() {
  console.log('\n📋 Importing requirements...')
  const wb = XLSX.readFile(path.resolve(__dirname, '../docs/Requirements_OrqoHire.xlsx'))
  const ws = wb.Sheets['Sheet1']
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

  const EMPLOYMENT_MAP = {
    'permanent': 'Full-time', 'fulltime': 'Full-time', 'full time': 'Full-time',
    'contract': 'Contract', 'contractual': 'Contract',
    'freelance': 'Freelance', 'intern': 'Intern', 'internship': 'Intern',
  }

  let imported = 0

  for (const row of rows) {
    try {
      const jobCode = String(row['Job Code'] || '').trim()
      if (!jobCode) continue

      const rawType = String(row['Mode of Employment'] ?? '').trim().toLowerCase()
      const employmentType = EMPLOYMENT_MAP[rawType] || (rawType === '-' ? null : null)

      const exp = parseExperience(row['Experience Required'])
      const budget = parseBudget(row['Budget'])
      const now = new Date().toISOString()

      await pool.query(`
        INSERT INTO requirements (
          id, job_code, client_name, designation, location, employment_type,
          min_experience, max_experience, vacancies, job_description,
          budget_min_lpa, budget_max_lpa, status, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        ON CONFLICT (job_code) DO UPDATE SET
          client_name = EXCLUDED.client_name,
          designation = EXCLUDED.designation,
          location = EXCLUDED.location,
          employment_type = EXCLUDED.employment_type,
          min_experience = EXCLUDED.min_experience,
          max_experience = EXCLUDED.max_experience,
          vacancies = EXCLUDED.vacancies,
          job_description = EXCLUDED.job_description,
          budget_min_lpa = EXCLUDED.budget_min_lpa,
          budget_max_lpa = EXCLUDED.budget_max_lpa,
          status = EXCLUDED.status,
          updated_at = NOW()
      `, [
        require('crypto').randomUUID(), jobCode,
        String(row['Company'] ?? '').trim(),
        String(row['Designation'] ?? '').trim(),
        String(row['Location'] ?? '').trim(),
        employmentType,
        exp.min, exp.max,
        parseInt(row['Openings']) || 1,
        String(row['JD'] ?? '').trim() || null,
        budget.min, budget.max,
        String(row['Status'] ?? '').trim() || 'Active',
        now, now,
      ])
      imported++
    } catch (e) {
      console.error('  ⚠️  Error:', e.message)
    }
  }
  console.log(`  ✅ ${imported} requirements imported`)
}

async function main() {
  console.log('🚀 OrqoHire Data Migration from Spreadsheets')
  console.log(`DB: ${process.env.DATABASE_URL?.replace(/\/\/[^@]+@/, '//***@')}\n`)

  try {
    await importCandidates()
    await importRequirements()
    console.log('\n✅ Migration complete!')
  } catch (e) {
    console.error('\n❌ Migration failed:', e.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
