// Leads and CRM prospects: who owns each record. Customers' records are shared by
// their company; inside PitchProX each lead/prospect belongs to one sales rep
// (assigned_to), and managers see everyone's. Called from ensureSchema() in lib/db.js.
export async function ensurePipelineSchema(database, addColumnIfMissing) {
  for (const table of ["leads", "prospects"]) {
    await addColumnIfMissing(table, "assigned_to", "VARCHAR(64) NULL");
    const [index] = await database.query(`SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${table}' AND INDEX_NAME = '${table}_assigned_idx'`);
    if (!index.length) await database.query(`ALTER TABLE ${table} ADD INDEX ${table}_assigned_idx (organization_id, assigned_to, updated_at)`);
  }
}
