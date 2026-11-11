// Phase 11: two-step login (authenticator app), sign-in challenges and attempt limits.
// Called from ensureSchema() in lib/db.js.
export async function ensureSecuritySchema(database) {
  // One row per person who set up an authenticator app. Secrets are encrypted (lib/mfa.js).
  // pending_secret: generated while setting up, until the first code is confirmed.
  // last_step: the last 30-second window used, so a code can't be used twice.
  await database.query(
    "CREATE TABLE IF NOT EXISTS user_mfa (user_id VARCHAR(64) PRIMARY KEY, secret VARCHAR(255) NULL, pending_secret VARCHAR(255) NULL, enabled_at DATETIME NULL, last_step BIGINT NULL, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT user_mfa_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // One-time recovery codes (hashed), for a lost phone
  await database.query(
    "CREATE TABLE IF NOT EXISTS mfa_recovery_codes (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, code_hash VARCHAR(64) NOT NULL, used_at DATETIME NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX mfa_recovery_user_idx (user_id), CONSTRAINT mfa_recovery_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // Password was right, the code is still to come (5 minutes, 5 tries)
  await database.query(
    "CREATE TABLE IF NOT EXISTS mfa_challenges (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, token_hash VARCHAR(64) NOT NULL UNIQUE, attempts INT NOT NULL DEFAULT 0, remember TINYINT(1) NOT NULL DEFAULT 0, expires_at DATETIME NOT NULL, used_at DATETIME NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT mfa_challenges_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // Attempt limits (lib/rate-limit.js): one row per attempt, counted over a time window
  await database.query(
    "CREATE TABLE IF NOT EXISTS rate_limit_hits (id BIGINT AUTO_INCREMENT PRIMARY KEY, bucket VARCHAR(40) NOT NULL, subject VARCHAR(191) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX rate_limit_lookup_idx (bucket, subject, created_at)) ENGINE=InnoDB"
  );
  // Phase 14: "See how it works" requests from the website (the video is shown at once and emailed).
  // Each one also becomes a prospect in PitchProX's own CRM (lead_id holds that prospect's id).
  await database.query(
    "CREATE TABLE IF NOT EXISTS demo_requests (id VARCHAR(64) PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(64) NULL, company VARCHAR(255) NULL, role VARCHAR(60) NULL, source VARCHAR(60) NULL, notes TEXT NULL, lead_id VARCHAR(64) NULL, ip VARCHAR(64) NULL, video_started_at DATETIME NULL, video_completed_at DATETIME NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX demo_requests_email_idx (email, created_at)) ENGINE=InnoDB"
  );
  // Phase 15: data deletion requests (website form, required by Facebook/Google sign-in).
  // status: open | in_progress | done | rejected. number gives the readable DEL-1001 reference.
  await database.query(
    "CREATE TABLE IF NOT EXISTS data_deletion_requests (id VARCHAR(64) PRIMARY KEY, number INT NOT NULL AUTO_INCREMENT UNIQUE, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, scope VARCHAR(20) NOT NULL DEFAULT 'account', details TEXT NULL, user_id VARCHAR(64) NULL, status VARCHAR(20) NOT NULL DEFAULT 'open', handled_by VARCHAR(64) NULL, handled_note VARCHAR(1000) NULL, ip VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NULL, completed_at DATETIME NULL, INDEX data_deletion_status_idx (status, created_at)) ENGINE=InnoDB AUTO_INCREMENT=1001"
  );
}
