// Leads and CRM prospects: who owns each record. Customers' records are shared by
// their company; inside PitchProX each lead/prospect belongs to one sales rep
// (assigned_to), and managers see everyone's. Called from ensureSchema() in lib/db.js.
export async function ensurePipelineSchema(database, addColumnIfMissing) {
  for (const table of ["leads", "prospects"]) {
    await addColumnIfMissing(table, "assigned_to", "VARCHAR(64) NULL");
    const [index] = await database.query(`SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${table}' AND INDEX_NAME = '${table}_assigned_idx'`);
    if (!index.length) await database.query(`ALTER TABLE ${table} ADD INDEX ${table}_assigned_idx (organization_id, assigned_to, updated_at)`);
  }

  // Phase 13: a lead or prospect can have several phone numbers, each with its own status, so a bad
  // number doesn't mark the whole contact (client, Nov 9). leads/prospects.phone_number keeps the
  // first callable number for search and lists.
  await database.query(
    "CREATE TABLE IF NOT EXISTS contact_phones (id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, lead_id VARCHAR(64) NULL, prospect_id VARCHAR(64) NULL, number VARCHAR(64) NOT NULL, digits VARCHAR(32) NOT NULL, label VARCHAR(10) NOT NULL DEFAULT 'Mobile', status VARCHAR(20) NOT NULL DEFAULT 'not_called', position INT NOT NULL DEFAULT 0, last_called_at DATETIME NULL, status_changed_at DATETIME NULL, status_changed_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX contact_phones_lead_idx (lead_id, position), INDEX contact_phones_prospect_idx (prospect_id, position), INDEX contact_phones_digits_idx (organization_id, digits), CONSTRAINT contact_phones_lead_fk FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE, CONSTRAINT contact_phones_prospect_fk FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // Records saved before this keep their one number as the first entry
  for (const [table, column] of [["leads", "lead_id"], ["prospects", "prospect_id"]]) {
    await database.query(
      `INSERT INTO contact_phones (id, organization_id, ${column}, number, digits, position)
       SELECT CONCAT('phone_', SUBSTRING(REPLACE(UUID(), '-', ''), 1, 24)), organization_id, id, phone_number, REGEXP_REPLACE(phone_number, '[^0-9]', ''), 0
       FROM ${table} WHERE phone_number IS NOT NULL AND phone_number <> ''
         AND NOT EXISTS (SELECT 1 FROM contact_phones WHERE contact_phones.${column} = ${table}.id)`
    );
  }
}
