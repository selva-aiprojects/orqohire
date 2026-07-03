export async function writeAuditLog(
  action: string,
  entity: string,
  entityId: string,
  userId: string,
  details?: string
) {
  try {
    const { execute } = await import('@/lib/db/pool')
    await execute(
      `INSERT INTO audit_log (action, entity, entity_id, user_id, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [action, entity, entityId, userId, details ?? '']
    )
  } catch {
    console.error('Audit log write failed — non-blocking')
  }
}
