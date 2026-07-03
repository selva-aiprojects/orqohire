const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

function loadEnv(file) {
  const abs = path.resolve(__dirname, '..', file)
  if (!fs.existsSync(abs)) return
  for (const line of fs.readFileSync(abs, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/)
    if (m) process.env[m[1]] = process.env[m[1]] || m[2]
  }
}

loadEnv('.env.local')

async function seedAll() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try {
    const hash = await bcrypt.hash('Admin@123', 10)
    const now = new Date().toISOString()

    // 1. Recruiter Admin
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
      [crypto.randomUUID(), 'admin@orqohire.com', hash, 'Recruiter Admin', 'super_admin', now]
    )

    // 2. Client SPOC
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, role, client_name, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, client_name = EXCLUDED.client_name`,
      [crypto.randomUUID(), 'client@company.com', hash, 'Client SPOC Demo', 'client_spoc', 'Acme Corp', now]
    )

    // 3. Candidate
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
      [crypto.randomUUID(), 'candidate@email.com', hash, 'Candidate Demo', 'candidate', now]
    )

    console.log('Successfully seeded all 3 demo accounts with password: Admin@123')
  } finally {
    await pool.end()
  }
}

seedAll().catch(err => { console.error(err); process.exit(1) })
