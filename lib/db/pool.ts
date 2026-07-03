import { Pool } from 'pg'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING

    if (!connectionString) {
      throw new Error(
        'Database connection string is missing. Please configure DATABASE_URL (or POSTGRES_URL) in your Vercel Dashboard under Project Settings -> Environment Variables.'
      )
    }

    const isSslRequired =
      process.env.DATABASE_SSL === 'true' ||
      connectionString.includes('sslmode=require') ||
      connectionString.includes('sslmode=no-verify') ||
      connectionString.includes('ssl=true')

    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      ...(isSslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
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
