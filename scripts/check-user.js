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

async function check() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, password_hash FROM users WHERE email = $1',
      ['admin@orqohire.com']
    )
    if (rows.length === 0) {
      console.log('User admin@orqohire.com NOT FOUND. Run: npm run seed:admin')
      return
    }
    const u = rows[0]
    console.log('Found:', u.email, '| role:', u.role, '| name:', u.name)
    console.log('Hash length:', u.password_hash.length)

    const ok = await bcrypt.compare('Admin@123', u.password_hash)
    console.log('Password "Admin@123" matches:', ok ? 'YES' : 'NO')
  } finally {
    await pool.end()
  }
}

check().catch(err => { console.error('ERROR:', err.message); process.exit(1) })
