// Customer companies sold by PitchProX sales reps: account owner, contact details,
// seats, and one-time activation links for the customer's first sign-in.
// Called from ensureSchema() in lib/db.js.
export async function ensureCustomerSchema(database) {
  await database.query(
    "CREATE TABLE IF NOT EXISTS customer_accounts (organization_id VARCHAR(64) PRIMARY KEY, account_rep_id VARCHAR(64) NULL, contact_phone VARCHAR(64) NULL, country VARCHAR(80) NULL, seats INT NOT NULL DEFAULT 1, source VARCHAR(20) NOT NULL DEFAULT 'self_signup', created_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX customer_accounts_rep_idx (account_rep_id, created_at), CONSTRAINT customer_accounts_org_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE, CONSTRAINT customer_accounts_rep_fk FOREIGN KEY (account_rep_id) REFERENCES users(id) ON DELETE SET NULL) ENGINE=InnoDB"
  );
  await database.query(
    "CREATE TABLE IF NOT EXISTS account_invites (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, token_hash VARCHAR(64) NOT NULL UNIQUE, expires_at DATETIME NOT NULL, accepted_at DATETIME NULL, created_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX account_invites_user_idx (user_id, created_at), CONSTRAINT account_invites_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // Every customer company has an account row (self sign-ups from before this table existed)
  await database.query(
    "INSERT IGNORE INTO customer_accounts (organization_id, source, created_at) SELECT DISTINCT organizations.id, 'self_signup', organizations.created_at FROM organizations JOIN users ON users.organization_id = organizations.id AND users.role = 'customer_admin'"
  );
  // ...and a subscription (self sign-ups start on the Free Trial)
  await database.query(
    "INSERT IGNORE INTO subscriptions (organization_id, plan_id, status, current_period_start) SELECT customer_accounts.organization_id, 'free-trial', 'trialing', customer_accounts.created_at FROM customer_accounts LEFT JOIN subscriptions ON subscriptions.organization_id = customer_accounts.organization_id WHERE subscriptions.organization_id IS NULL"
  );
  // Customers who can't sign in yet (invited by a rep, password not set)
  const [column] = await database.query("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password_set'");
  if (!column.length) await database.query("ALTER TABLE users ADD COLUMN password_set TINYINT(1) NOT NULL DEFAULT 1");
}
