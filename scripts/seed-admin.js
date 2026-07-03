const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
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

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in .env.local')
  process.exit(1)
}

async function seed() {
  const email = process.argv[2] || 'admin@orqohire.com'
  const password = process.argv[3] || 'Admin@123'

  const pool = new Pool({ connectionString: DATABASE_URL })

  try {
    const hash = await bcrypt.hash(password, 10)
    const id = require('crypto').randomUUID()
    const now = new Date().toISOString()

    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             name = EXCLUDED.name,
             role = EXCLUDED.role`,
      [id, email, hash, 'Admin', 'super_admin', now]
    )

    console.log(`super_admin user created/updated:`)
    console.log(`  Email:    ${email}`)
    console.log(`  Password: ${password}`)
  } finally {
    await pool.end()
  }
}

seed().catch(err => { console.error(err); process.exit(1) })
