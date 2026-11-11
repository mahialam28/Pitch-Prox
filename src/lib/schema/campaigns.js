// Phase 5: Campaigns & Journeys — segments, email templates, broadcast campaigns, lifecycle
// journeys, user events, the email outbox and suppressions. Called from ensureSchema() in lib/db.js.
export async function ensureCampaignSchema(database, addColumnIfMissing) {
  // Segments: Dynamic (rules JSON, membership computed) or Static (members table)
  await database.query(
    "CREATE TABLE IF NOT EXISTS campaign_segments (id VARCHAR(64) PRIMARY KEY, name VARCHAR(120) NOT NULL, description VARCHAR(300) NULL, type VARCHAR(10) NOT NULL, rules JSON NULL, system_key VARCHAR(40) NULL UNIQUE, created_by VARCHAR(64) NULL, created_by_name VARCHAR(255) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NULL, archived_at DATETIME NULL) ENGINE=InnoDB"
  );
  await database.query(
    "CREATE TABLE IF NOT EXISTS campaign_segment_members (segment_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (segment_id, user_id), CONSTRAINT segment_members_segment_fk FOREIGN KEY (segment_id) REFERENCES campaign_segments(id) ON DELETE CASCADE, CONSTRAINT segment_members_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // Last known membership of every segment, so the job runner can tell who entered or left
  await database.query(
    "CREATE TABLE IF NOT EXISTS campaign_segment_snapshot (segment_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, entered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (segment_id, user_id), CONSTRAINT segment_snapshot_segment_fk FOREIGN KEY (segment_id) REFERENCES campaign_segments(id) ON DELETE CASCADE, CONSTRAINT segment_snapshot_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // Tags staff or journeys put on customer users ("User Tag" rules, Add/Remove User Tag steps)
  await database.query(
    "CREATE TABLE IF NOT EXISTS customer_user_tags (user_id VARCHAR(64) NOT NULL, tag VARCHAR(60) NOT NULL, added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, tag), CONSTRAINT customer_user_tags_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // Fields journeys can set ("Update User Field": Lifecycle Stage …)
  await database.query(
    "CREATE TABLE IF NOT EXISTS customer_user_fields (user_id VARCHAR(64) NOT NULL, field VARCHAR(40) NOT NULL, value VARCHAR(120) NOT NULL, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (user_id, field), CONSTRAINT customer_user_fields_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );

  // Email templates for campaigns, journeys and transactional emails.
  // creation_method: build | design | html; content JSON holds the builder fields or the design images + CTA.
  // trigger_event: Transactional templates sent automatically when that event happens (client item 299).
  await database.query(
    "CREATE TABLE IF NOT EXISTS campaign_templates (id VARCHAR(64) PRIMARY KEY, name VARCHAR(120) NOT NULL, email_type VARCHAR(20) NOT NULL, category VARCHAR(20) NOT NULL, subject VARCHAR(255) NOT NULL, preheader VARCHAR(255) NULL, from_name VARCHAR(120) NOT NULL, reply_to VARCHAR(255) NULL, creation_method VARCHAR(10) NOT NULL, content JSON NULL, html MEDIUMTEXT NULL, status VARCHAR(10) NOT NULL DEFAULT 'Draft', trigger_event VARCHAR(60) NULL, created_by VARCHAR(64) NULL, created_by_name VARCHAR(255) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NULL, INDEX campaign_templates_trigger_idx (trigger_event, status)) ENGINE=InnoDB"
  );
  // Images uploaded for "Upload Design" templates; served publicly so they load inside emails
  await database.query(
    "CREATE TABLE IF NOT EXISTS campaign_assets (id VARCHAR(64) PRIMARY KEY, storage_path VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, mime VARCHAR(120) NOT NULL, size INT NOT NULL, created_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB"
  );

  // Broadcast campaigns: one-time or scheduled sends to a segment
  await database.query(
    "CREATE TABLE IF NOT EXISTS campaigns (id VARCHAR(64) PRIMARY KEY, name VARCHAR(160) NOT NULL, segment_id VARCHAR(64) NULL, template_id VARCHAR(64) NULL, send_option VARCHAR(10) NOT NULL, scheduled_at DATETIME NULL, optimize_send_time TINYINT(1) NOT NULL DEFAULT 0, status VARCHAR(12) NOT NULL DEFAULT 'scheduled', recipients INT NOT NULL DEFAULT 0, sent_at DATETIME NULL, canceled_at DATETIME NULL, created_by VARCHAR(64) NULL, created_by_name VARCHAR(255) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NULL, INDEX campaigns_due_idx (status, scheduled_at), CONSTRAINT campaigns_segment_fk FOREIGN KEY (segment_id) REFERENCES campaign_segments(id) ON DELETE SET NULL, CONSTRAINT campaigns_template_fk FOREIGN KEY (template_id) REFERENCES campaign_templates(id) ON DELETE SET NULL) ENGINE=InnoDB"
  );

  // Lifecycle journeys: trigger, audience, re-entry, exit conditions and the step tree (JSON)
  await database.query(
    "CREATE TABLE IF NOT EXISTS journeys (id VARCHAR(64) PRIMARY KEY, name VARCHAR(160) NOT NULL, description VARCHAR(500) NULL, trigger_config JSON NOT NULL, audience JSON NOT NULL, reentry JSON NOT NULL, exit_conditions JSON NOT NULL, goal VARCHAR(60) NULL, steps JSON NOT NULL, status VARCHAR(10) NOT NULL DEFAULT 'draft', published_at DATETIME NULL, created_by VARCHAR(64) NULL, created_by_name VARCHAR(255) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NULL) ENGINE=InnoDB"
  );
  // One row per user per pass through a journey. position = where they are in the step tree.
  await database.query(
    "CREATE TABLE IF NOT EXISTS journey_enrollments (id VARCHAR(64) PRIMARY KEY, journey_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, status VARCHAR(10) NOT NULL DEFAULT 'active', position JSON NULL, trigger_key VARCHAR(160) NULL, context JSON NULL, steps_run INT NOT NULL DEFAULT 0, next_run_at DATETIME NULL, entered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, finished_at DATETIME NULL, exit_reason VARCHAR(160) NULL, goal_reached_at DATETIME NULL, INDEX journey_enrollments_due_idx (status, next_run_at), INDEX journey_enrollments_user_idx (journey_id, user_id, entered_at), CONSTRAINT journey_enrollments_journey_fk FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE, CONSTRAINT journey_enrollments_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );

  // What customer users do (sign-up, trial, calibration, plan changes …). The job runner reads
  // new events to start journeys and transactional emails.
  await database.query(
    "CREATE TABLE IF NOT EXISTS user_events (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, organization_id VARCHAR(64) NULL, event VARCHAR(60) NOT NULL, data JSON NULL, occurred_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), processed_at DATETIME NULL, INDEX user_events_unprocessed_idx (processed_at, occurred_at), INDEX user_events_user_idx (user_id, event, occurred_at), CONSTRAINT user_events_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );

  // Every email PitchProX sends to customers goes through this outbox.
  // source: campaign | journey | transactional. status: queued | sent | failed | skipped
  await database.query(
    "CREATE TABLE IF NOT EXISTS email_deliveries (id VARCHAR(64) PRIMARY KEY, source VARCHAR(15) NOT NULL, source_id VARCHAR(64) NULL, enrollment_id VARCHAR(64) NULL, template_id VARCHAR(64) NULL, user_id VARCHAR(64) NULL, to_email VARCHAR(255) NOT NULL, subject VARCHAR(255) NOT NULL, html MEDIUMTEXT NOT NULL, status VARCHAR(10) NOT NULL DEFAULT 'queued', status_reason VARCHAR(255) NULL, attempts INT NOT NULL DEFAULT 0, provider_id VARCHAR(255) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, sent_at DATETIME NULL, opened_at DATETIME NULL, clicked_at DATETIME NULL, INDEX email_deliveries_status_idx (status, created_at), INDEX email_deliveries_source_idx (source, source_id), INDEX email_deliveries_user_idx (user_id, template_id)) ENGINE=InnoDB"
  );
  // Phase 7 (Postmark): which stream sends it, a claim while it is being sent, and what Postmark reports back
  await addColumnIfMissing("email_deliveries", "stream", "VARCHAR(13) NOT NULL DEFAULT 'transactional'"); // transactional | broadcast
  await addColumnIfMissing("email_deliveries", "locked_at", "DATETIME NULL");
  await addColumnIfMissing("email_deliveries", "delivered_at", "DATETIME NULL");
  await addColumnIfMissing("email_deliveries", "bounced_at", "DATETIME NULL");
  await addColumnIfMissing("email_deliveries", "complained_at", "DATETIME NULL");
  await addColumnIfMissing("email_deliveries", "provider_status", "VARCHAR(255) NULL");
  // Phase 10: emails people write in Mail carry their own sender name, Reply-To, CC/BCC and open tracking
  await addColumnIfMissing("email_deliveries", "from_name", "VARCHAR(160) NULL");
  await addColumnIfMissing("email_deliveries", "reply_to", "VARCHAR(255) NULL");
  await addColumnIfMissing("email_deliveries", "cc", "VARCHAR(1000) NULL");
  await addColumnIfMissing("email_deliveries", "bcc", "VARCHAR(1000) NULL");
  await addColumnIfMissing("email_deliveries", "track_opens", "TINYINT(1) NULL");
  // Emails queued before streams existed: Marketing/Lifecycle templates go out on Broadcast
  await database.query(
    "UPDATE email_deliveries JOIN campaign_templates ON campaign_templates.id = email_deliveries.template_id SET email_deliveries.stream = 'broadcast' WHERE email_deliveries.status = 'queued' AND email_deliveries.stream = 'transactional' AND campaign_templates.email_type <> 'Transactional'"
  );
  // Every event Postmark sends to the webhook (delivery, bounce, spam complaint, open, click, subscription change)
  await database.query(
    "CREATE TABLE IF NOT EXISTS email_events (id VARCHAR(64) PRIMARY KEY, delivery_id VARCHAR(64) NULL, record_type VARCHAR(30) NOT NULL, email VARCHAR(255) NULL, provider_id VARCHAR(255) NULL, detail JSON NULL, occurred_at DATETIME NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX email_events_delivery_idx (delivery_id, occurred_at), INDEX email_events_type_idx (record_type, occurred_at)) ENGINE=InnoDB"
  );
  // Password reset links (one hour, single use; only the hash is stored)
  await database.query(
    "CREATE TABLE IF NOT EXISTS password_resets (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, token_hash VARCHAR(64) NOT NULL UNIQUE, expires_at DATETIME NOT NULL, used_at DATETIME NULL, ip VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX password_resets_user_idx (user_id, created_at), CONSTRAINT password_resets_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // Addresses that unsubscribed (Marketing + Lifecycle) or hard-bounced
  await database.query(
    "CREATE TABLE IF NOT EXISTS email_suppressions (email VARCHAR(255) PRIMARY KEY, reason VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB"
  );
  // Server-side secrets generated on first use (e.g. for signing unsubscribe links)
  await database.query("CREATE TABLE IF NOT EXISTS app_secrets (name VARCHAR(40) PRIMARY KEY, value VARCHAR(128) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB");
  // When each job last ran (shown on the Overview)
  await database.query(
    "CREATE TABLE IF NOT EXISTS job_runs (job VARCHAR(40) PRIMARY KEY, last_started_at DATETIME NULL, last_finished_at DATETIME NULL, last_result JSON NULL, last_error VARCHAR(500) NULL) ENGINE=InnoDB"
  );
}
