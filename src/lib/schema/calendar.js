// Internal (staff) calendar events. Called from ensureSchema() in lib/db.js.
export async function ensureCalendarSchema(database) {
  await database.query(
    "CREATE TABLE IF NOT EXISTS calendar_events (id VARCHAR(64) PRIMARY KEY, owner_id VARCHAR(64) NOT NULL, title VARCHAR(255) NOT NULL, description TEXT NULL, event_type VARCHAR(40) NOT NULL, department VARCHAR(40) NULL, visibility VARCHAR(30) NOT NULL DEFAULT 'All Employees', location_link VARCHAR(500) NULL, starts_at DATETIME NOT NULL, ends_at DATETIME NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX calendar_events_range_idx (starts_at, ends_at), INDEX calendar_events_owner_idx (owner_id, starts_at), CONSTRAINT calendar_events_owner_fk FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
}
