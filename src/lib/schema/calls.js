// AI phase 2: calls made with PitchProX (live, and practice calls with a simulated prospect).
// Called from ensureSchema() in lib/db.js.
//
// calls: one row per call. `context` is what the call service loads to start the AI Core (user,
// active playbook version, calibration profile, contact + prior-call memory, disclosure);
// `summary` holds the numbers lists and usage need; `handoff` is the full post-call record
// (Spec 01 §14: transcript, prompts, outcomes, state timeline, evidence, compliance events).
// mode: live | practice (practice calls never use up the plan's calls).
// status: active | completed | abandoned.
export async function ensureCallsSchema(database, addColumnIfMissing) {
  await database.query(
    "CREATE TABLE IF NOT EXISTS calls (id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, mode VARCHAR(10) NOT NULL DEFAULT 'live', status VARCHAR(12) NOT NULL DEFAULT 'active', contact_kind VARCHAR(10) NULL, contact_id VARCHAR(64) NULL, phone_id VARCHAR(64) NULL, contact_name VARCHAR(255) NULL, phone_number VARCHAR(64) NULL, lead_type VARCHAR(60) NULL, playbook_id VARCHAR(64) NULL, playbook_title VARCHAR(255) NULL, playbook_version INT NULL, calibration_profile_id VARCHAR(64) NULL, practice_script VARCHAR(60) NULL, context MEDIUMTEXT NULL, summary TEXT NULL, handoff LONGTEXT NULL, token_hash VARCHAR(64) NULL, started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ended_at DATETIME NULL, duration_seconds INT NULL, ended_reason VARCHAR(40) NULL, INDEX calls_org_idx (organization_id, mode, started_at), INDEX calls_user_idx (user_id, started_at), INDEX calls_contact_idx (contact_kind, contact_id, started_at), CONSTRAINT calls_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE, CONSTRAINT calls_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // The transcript, one row per finalized utterance (searchable; reports read it)
  await database.query(
    "CREATE TABLE IF NOT EXISTS call_turns (id BIGINT AUTO_INCREMENT PRIMARY KEY, call_id VARCHAR(64) NOT NULL, seq INT NOT NULL, speaker VARCHAR(10) NOT NULL, text TEXT NOT NULL, start_ms INT NOT NULL DEFAULT 0, end_ms INT NOT NULL DEFAULT 0, intent VARCHAR(30) NULL, INDEX call_turns_call_idx (call_id, seq), CONSTRAINT call_turns_call_fk FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // AI-4: the post-call report (lib/ai/report.js). For live calls the detailed sections are
  // unlocked per call and count against the plan's reports (practice calls are always open).
  await addColumnIfMissing("calls", "report", "MEDIUMTEXT NULL");
  await addColumnIfMissing("calls", "report_unlocked_at", "DATETIME NULL");
  // The call's outcome as the user sees it (Appointment Set, Follow-Up Required, …); defaulted from the call
  await addColumnIfMissing("calls", "disposition", "VARCHAR(40) NULL");
}
