import { Pool } from 'pg'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
    })

    pool.on('error', (err) => {
      console.error('Unexpected pool error', err)
    })
  }
  return pool
}

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const client = await getPool().connect()
  try {
    const res = await client.query(text, params)
    return res.rows as T[]
  } finally {
    client.release()
  }
}

export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}

export async function execute(
  text: string,
  params?: any[]
): Promise<number> {
  const client = await getPool().connect()
  try {
    const res = await client.query(text, params)
    return res.rowCount ?? 0
  } finally {
    client.release()
  }
}
