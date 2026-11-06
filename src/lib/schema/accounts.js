// Phase 3: managing customer accounts from the staff portals.
// Called from ensureSchema() in lib/db.js (after ensureCustomerSchema).
export async function ensureAccountSchema(database, addColumnIfMissing) {
  // Account status and company profile
  await addColumnIfMissing("customer_accounts", "status", "VARCHAR(20) NOT NULL DEFAULT 'active'"); // active | suspended | deleted
  await addColumnIfMissing("customer_accounts", "status_reason", "VARCHAR(500) NULL");
  await addColumnIfMissing("customer_accounts", "status_changed_at", "DATETIME NULL");
  await addColumnIfMissing("customer_accounts", "industry", "VARCHAR(120) NULL");
  await addColumnIfMissing("customer_accounts", "website", "VARCHAR(255) NULL");
  await addColumnIfMissing("customer_accounts", "address", "VARCHAR(500) NULL");
  await addColumnIfMissing("customer_accounts", "timezone", "VARCHAR(80) NULL");
  await addColumnIfMissing("customer_accounts", "company_size", "VARCHAR(40) NULL");
  await addColumnIfMissing("customer_accounts", "billing_email", "VARCHAR(255) NULL");

  // Subscription changes that wait for a date
  await addColumnIfMissing("subscriptions", "paused_until", "DATE NULL");
  await addColumnIfMissing("subscriptions", "cancel_at_period_end", "TINYINT(1) NOT NULL DEFAULT 0");
  // Why and when a cancellation was requested (Performance Analytics → Top Cancellation Reasons)
  await addColumnIfMissing("subscriptions", "cancel_reason", "VARCHAR(200) NULL");
  await addColumnIfMissing("subscriptions", "cancel_requested_at", "DATETIME NULL");
  await addColumnIfMissing("subscriptions", "scheduled_plan_id", "VARCHAR(64) NULL");
  await addColumnIfMissing("subscriptions", "scheduled_cycle", "VARCHAR(20) NULL");

  // Impersonation: the customer session a staff member is using, and when it runs out
  await addColumnIfMissing("sessions", "impersonation_id", "VARCHAR(64) NULL");

  // Internal notes about a customer account
  await database.query(
    "CREATE TABLE IF NOT EXISTS account_notes (id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, author_id VARCHAR(64) NOT NULL, body TEXT NOT NULL, pinned TINYINT(1) NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX account_notes_org_idx (organization_id, created_at), CONSTRAINT account_notes_org_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE, CONSTRAINT account_notes_author_fk FOREIGN KEY (author_id) REFERENCES users(id)) ENGINE=InnoDB"
  );

  // Credits & adjustments ledger. Rows are never edited or deleted once applied:
  // a mistake is undone with a "reversal" row that points at the original.
  // kind: calls | reports | credit | discount | refund | reversal
  // status: pending (waiting for a Super Admin) | applied | rejected
  await database.query(
    "CREATE TABLE IF NOT EXISTS account_adjustments (id VARCHAR(64) PRIMARY KEY, number INT NOT NULL AUTO_INCREMENT UNIQUE, organization_id VARCHAR(64) NOT NULL, kind VARCHAR(20) NOT NULL, quantity INT NULL, amount_cents INT NULL, apply_to VARCHAR(40) NULL, reason VARCHAR(500) NOT NULL, status VARCHAR(20) NOT NULL, requested_by VARCHAR(64) NOT NULL, decided_by VARCHAR(64) NULL, decided_at DATETIME NULL, decision_note VARCHAR(500) NULL, reverses_id VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX account_adjustments_org_idx (organization_id, created_at), INDEX account_adjustments_status_idx (status, created_at), CONSTRAINT account_adjustments_org_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE, CONSTRAINT account_adjustments_requester_fk FOREIGN KEY (requested_by) REFERENCES users(id)) ENGINE=InnoDB AUTO_INCREMENT=1001"
  );

  // "View as customer" sessions started by staff
  await database.query(
    "CREATE TABLE IF NOT EXISTS impersonation_sessions (id VARCHAR(64) PRIMARY KEY, staff_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, organization_id VARCHAR(64) NOT NULL, access VARCHAR(20) NOT NULL, reason VARCHAR(500) NOT NULL, started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ended_at DATETIME NULL, INDEX impersonation_staff_idx (staff_id, started_at), INDEX impersonation_org_idx (organization_id, started_at), CONSTRAINT impersonation_staff_fk FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE, CONSTRAINT impersonation_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  await addColumnIfMissing("impersonation_sessions", "expires_at", "DATETIME NULL");
  // Notes have a title, a type and can be edited
  await addColumnIfMissing("account_notes", "title", "VARCHAR(255) NULL");
  await addColumnIfMissing("account_notes", "type", "VARCHAR(40) NOT NULL DEFAULT 'Lead Insight'");
  await addColumnIfMissing("account_notes", "updated_at", "DATETIME NULL");
  await addColumnIfMissing("account_notes", "updated_by", "VARCHAR(64) NULL");
}
