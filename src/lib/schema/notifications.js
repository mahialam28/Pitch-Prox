// Phase 9: in-app notifications behind the bell. Called from ensureSchema() in lib/db.js.
export async function ensureNotificationSchema(database) {
  // One row per person per event. type: policy | training | incident | coaching | ticket | approval
  await database.query(
    "CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, type VARCHAR(20) NOT NULL, title VARCHAR(160) NOT NULL, body VARCHAR(500) NULL, link VARCHAR(300) NULL, entity_type VARCHAR(40) NULL, entity_id VARCHAR(64) NULL, actor_name VARCHAR(255) NULL, read_at DATETIME NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX notifications_user_idx (user_id, created_at), INDEX notifications_unread_idx (user_id, read_at), CONSTRAINT notifications_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
}
