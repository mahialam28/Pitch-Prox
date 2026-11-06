// Phase 4: Sales team management — quotas, coaching / manager notes, rep workspace settings.
// Called from ensureSchema() in lib/db.js (after the staff schema).
export async function ensureTeamSchema(database) {
  // Monthly revenue quota per rep. A row applies from its month onward until a
  // later row replaces it, so a quota is set once and carries forward.
  await database.query(
    "CREATE TABLE IF NOT EXISTS sales_quotas (user_id VARCHAR(64) NOT NULL, effective_month CHAR(7) NOT NULL, revenue_cents INT NOT NULL, updated_by VARCHAR(64) NULL, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (user_id, effective_month), CONSTRAINT sales_quotas_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // kind: coaching (shared with the rep) | manager (private to managers)
  await database.query(
    "CREATE TABLE IF NOT EXISTS rep_notes (id VARCHAR(64) PRIMARY KEY, rep_id VARCHAR(64) NOT NULL, author_id VARCHAR(64) NULL, author_name VARCHAR(255) NOT NULL, kind VARCHAR(20) NOT NULL, note_type VARCHAR(40) NULL, title VARCHAR(160) NULL, body TEXT NOT NULL, related_to VARCHAR(160) NULL, priority VARCHAR(10) NULL, due_date DATE NULL, completed_at DATETIME NULL, completed_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NULL, INDEX rep_notes_rep_idx (rep_id, kind, created_at), CONSTRAINT rep_notes_rep_fk FOREIGN KEY (rep_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // Staff announcements (Calendar & Announcements). Status comes from the dates:
  // scheduled until publish_at, active until expires_at, then archived (or archived_at when archived by hand).
  await database.query(
    "CREATE TABLE IF NOT EXISTS announcements (id VARCHAR(64) PRIMARY KEY, title VARCHAR(160) NOT NULL, body TEXT NOT NULL, priority VARCHAR(20) NOT NULL DEFAULT 'normal', audience VARCHAR(40) NOT NULL DEFAULT 'All Employees', publish_at DATETIME NOT NULL, expires_at DATETIME NULL, notify TINYINT(1) NOT NULL DEFAULT 1, author_id VARCHAR(64) NULL, author_name VARCHAR(255) NOT NULL, archived_at DATETIME NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NULL, INDEX announcements_publish_idx (publish_at)) ENGINE=InnoDB"
  );
  // Each person can dismiss an announcement from their own list
  await database.query(
    "CREATE TABLE IF NOT EXISTS announcement_dismissals (announcement_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, dismissed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (announcement_id, user_id), CONSTRAINT announcement_dismissals_announcement_fk FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE, CONSTRAINT announcement_dismissals_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // Email templates staff write (the built-in library stays in lib/catalogs). scope: personal | team
  await database.query(
    "CREATE TABLE IF NOT EXISTS mail_templates (id VARCHAR(64) PRIMARY KEY, scope VARCHAR(20) NOT NULL DEFAULT 'personal', owner_id VARCHAR(64) NULL, title VARCHAR(120) NOT NULL, category VARCHAR(40) NOT NULL, subject VARCHAR(255) NOT NULL, body TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NULL, INDEX mail_templates_owner_idx (owner_id), CONSTRAINT mail_templates_owner_fk FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // One row per day with the business totals (Performance Analytics trends and sparklines).
  // Written the first time the analytics are loaded each day; history starts when this ships.
  await database.query(
    "CREATE TABLE IF NOT EXISTS analytics_snapshots (day DATE PRIMARY KEY, mrr_cents BIGINT NOT NULL, active_subscribers INT NOT NULL, trialing INT NOT NULL, paused INT NOT NULL, total_accounts INT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB"
  );
  // Workspace and access settings a manager sets for a rep (Account Settings tab)
  await database.query(
    "CREATE TABLE IF NOT EXISTS rep_settings (user_id VARCHAR(64) PRIMARY KEY, settings JSON NOT NULL, updated_by VARCHAR(64) NULL, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT rep_settings_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
}
