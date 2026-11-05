// Staff side of support tickets: who owns a ticket, escalation, and internal notes
// that customers never see. Called from ensureSchema() in lib/db.js.
export async function ensureSupportSchema(database, addColumnIfMissing) {
  await addColumnIfMissing("support_tickets", "assigned_to", "VARCHAR(64) NULL");
  await addColumnIfMissing("support_tickets", "escalated_at", "DATETIME NULL");
  await addColumnIfMissing("support_tickets", "first_response_at", "DATETIME NULL");
  await addColumnIfMissing("support_tickets", "resolved_at", "DATETIME NULL");
  // Staff member who opened the ticket for a customer (Mail → Support Tickets)
  await addColumnIfMissing("support_tickets", "opened_by", "VARCHAR(64) NULL");
  await database.query(
    "CREATE TABLE IF NOT EXISTS support_internal_notes (id VARCHAR(64) PRIMARY KEY, ticket_id VARCHAR(64) NOT NULL, author_id VARCHAR(64) NOT NULL, body TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX support_notes_ticket_idx (ticket_id, created_at), CONSTRAINT support_notes_ticket_fk FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE, CONSTRAINT support_notes_author_fk FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
}
