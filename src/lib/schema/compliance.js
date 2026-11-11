// Phase 6: Compliance & Audit — policy versions and approvals, training (courses,
// library materials, categories, assignments), incidents and evidence. Called from ensureSchema() in lib/db.js after the
// staff schema, which created policy_documents and policy_acknowledgments.
// Relative imports only (CLI scripts load this file).
import { SOC2_CONTROL_LIBRARY } from "../compliance/evidence-catalog.js";

// Topic shown in Policy Documents for the policies seeded in Phase 1
const SEEDED_TOPICS = {
  infosec: "Security",
  "access-control": "Access & Identity",
  "acceptable-use": "Security",
  "data-retention": "Data Privacy",
  offboarding: "HR & People",
  password: "Security",
  "ai-ethics": "Compliance",
  "ai-disclosure": "Compliance",
  "recording-consent": "Compliance",
};

// One-line summaries for those policies (shown in the table; admins can edit them)
const SEEDED_DESCRIPTIONS = {
  infosec: "How PitchProX protects its systems, customer data and confidential information.",
  "access-control": "How access to systems is granted, reviewed and removed.",
  "acceptable-use": "Rules for using company devices, accounts and networks.",
  "data-retention": "How long each kind of data is kept and how it is deleted.",
  offboarding: "Returning equipment and removing access when someone leaves.",
  password: "Password strength, storage and multi-factor sign-in requirements.",
  "ai-ethics": "Standards for honest, fair and respectful use of AI guidance.",
  "ai-disclosure": "When and how to tell a prospect that AI or recording is in use.",
  "recording-consent": "Consent before recording a call, and how recordings are stored and deleted.",
};

export async function ensureComplianceSchema(database, addColumnIfMissing) {
  // ── Policy documents ──
  // policy_documents holds the version employees sign now (its `version`, `body`, `effective_date`);
  // status: draft | under_review (never approved yet) | published | archived.
  // `category` stays the onboarding step (company → Review Policies, ai → AI Ethics); `topic` is the
  // category shown in Policy Documents.
  await addColumnIfMissing("policy_documents", "topic", "VARCHAR(40) NULL");
  await addColumnIfMissing("policy_documents", "description", "VARCHAR(500) NULL");
  await addColumnIfMissing("policy_documents", "owner_id", "VARCHAR(64) NULL");
  await addColumnIfMissing("policy_documents", "next_review_date", "DATE NULL");
  await addColumnIfMissing("policy_documents", "approved_at", "DATETIME NULL");
  await addColumnIfMissing("policy_documents", "current_version_id", "VARCHAR(64) NULL");
  await addColumnIfMissing("policy_documents", "ack_due_days", "INT NOT NULL DEFAULT 14");
  await addColumnIfMissing("policy_documents", "created_by", "VARCHAR(64) NULL");
  for (const [id, topic] of Object.entries(SEEDED_TOPICS)) {
    await database.execute("UPDATE policy_documents SET topic = ? WHERE id = ? AND topic IS NULL", [topic, id]);
    await database.execute("UPDATE policy_documents SET description = ? WHERE id = ? AND description IS NULL", [SEEDED_DESCRIPTIONS[id], id]);
  }
  await database.query("UPDATE policy_documents SET approved_at = COALESCE(approved_at, CAST(effective_date AS DATETIME), created_at) WHERE status = 'published' AND approved_at IS NULL");
  await database.query("UPDATE policy_documents SET next_review_date = DATE_ADD(COALESCE(effective_date, DATE(created_at)), INTERVAL 1 YEAR) WHERE next_review_date IS NULL AND status = 'published'");

  // Every version of a policy. status: draft | under_review | approved (the one in force) |
  // superseded (approved earlier) | rejected (sent back with a review note).
  await database.query(
    "CREATE TABLE IF NOT EXISTS policy_versions (id VARCHAR(64) PRIMARY KEY, policy_id VARCHAR(64) NOT NULL, version VARCHAR(20) NOT NULL, status VARCHAR(20) NOT NULL, title VARCHAR(255) NOT NULL, topic VARCHAR(40) NULL, description VARCHAR(500) NULL, body JSON NULL, effective_date DATE NULL, next_review_date DATE NULL, required TINYINT(1) NOT NULL DEFAULT 1, file_path VARCHAR(500) NULL, file_name VARCHAR(255) NULL, file_size BIGINT NULL, file_mime VARCHAR(120) NULL, change_note VARCHAR(500) NULL, review_note VARCHAR(500) NULL, restored_from VARCHAR(20) NULL, created_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, submitted_by VARCHAR(64) NULL, submitted_at DATETIME NULL, decided_by VARCHAR(64) NULL, decided_at DATETIME NULL, UNIQUE KEY policy_versions_unique (policy_id, version), INDEX policy_versions_status_idx (status, submitted_at), CONSTRAINT policy_versions_policy_fk FOREIGN KEY (policy_id) REFERENCES policy_documents(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // The seeded policies start with their current version on record
  await database.query(
    `INSERT IGNORE INTO policy_versions (id, policy_id, version, status, title, topic, description, body, effective_date, next_review_date, required, created_at, decided_at)
     SELECT CONCAT('pver_', id, '_', REPLACE(version, '.', '_')), id, version, 'approved', title, topic, description, body, effective_date, next_review_date, required, created_at, approved_at
     FROM policy_documents WHERE status = 'published' AND current_version_id IS NULL`
  );
  await database.query("UPDATE policy_documents SET current_version_id = CONCAT('pver_', id, '_', REPLACE(version, '.', '_')) WHERE status = 'published' AND current_version_id IS NULL");

  await database.query("UPDATE policy_versions JOIN policy_documents ON policy_documents.id = policy_versions.policy_id SET policy_versions.description = policy_documents.description WHERE policy_versions.description IS NULL AND policy_versions.created_by IS NULL AND policy_documents.description IS NOT NULL");

  // Reminders sent to employees who haven't signed (the email waits in the outbox until a provider is connected)
  await database.query(
    "CREATE TABLE IF NOT EXISTS policy_reminders (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, policy_ids JSON NOT NULL, sent_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX policy_reminders_user_idx (user_id, created_at), CONSTRAINT policy_reminders_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );

  // ── Training ──
  // A Training is a complete course (training_courses); a Training Material is one PDF, Doc or
  // Video in the library, and a Training contains one or more materials. The onboarding course
  // (required_for_onboarding = 1) keeps its own modules.
  await database.query(
    "CREATE TABLE IF NOT EXISTS training_categories (id VARCHAR(64) PRIMARY KEY, name VARCHAR(80) NOT NULL, name_key VARCHAR(80) NOT NULL, description VARCHAR(255) NULL, created_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY training_categories_name (name_key)) ENGINE=InnoDB"
  );
  for (const [id, name, description] of [
    ["tcat_security", "Security", "Security awareness, phishing and access handling"],
    ["tcat_privacy", "Privacy", "Personal data, privacy law and customer data protection"],
    ["tcat_ai_ethics", "AI Ethics", "Responsible use of AI guidance and call disclosure"],
    ["tcat_compliance", "Compliance", "Policies, procedures and regulatory requirements"],
  ]) {
    await database.execute("INSERT IGNORE INTO training_categories (id, name, name_key, description) VALUES (?, ?, ?, ?)", [id, name, name.toLowerCase(), description]);
  }
  await addColumnIfMissing("training_courses", "category_id", "VARCHAR(64) NULL");
  await addColumnIfMissing("training_courses", "requirement", "VARCHAR(20) NOT NULL DEFAULT 'Required'");
  await addColumnIfMissing("training_courses", "issue_certificate", "TINYINT(1) NOT NULL DEFAULT 0");
  await addColumnIfMissing("training_courses", "certificate_validity", "VARCHAR(20) NOT NULL DEFAULT 'Does Not Expire'");
  await addColumnIfMissing("training_courses", "certificate_months", "INT NULL");
  await addColumnIfMissing("training_courses", "created_by", "VARCHAR(64) NULL");
  await addColumnIfMissing("training_courses", "updated_at", "DATETIME NULL");
  await database.query("UPDATE training_courses JOIN training_categories ON training_categories.name_key = LOWER(training_courses.category) SET training_courses.category_id = training_categories.id WHERE training_courses.category_id IS NULL");

  // Library materials. format: PDF | Doc | Video; a video is an uploaded file or a link.
  await database.query(
    "CREATE TABLE IF NOT EXISTS training_materials (id VARCHAR(64) PRIMARY KEY, title VARCHAR(255) NOT NULL, description VARCHAR(500) NULL, format VARCHAR(10) NOT NULL, category_id VARCHAR(64) NULL, file_path VARCHAR(500) NULL, file_name VARCHAR(255) NULL, file_size BIGINT NULL, file_mime VARCHAR(120) NULL, video_url VARCHAR(500) NULL, minutes INT NULL, status VARCHAR(20) NOT NULL DEFAULT 'active', created_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX training_materials_category_idx (category_id), INDEX training_materials_status_idx (status, created_at)) ENGINE=InnoDB"
  );
  await database.query(
    "CREATE TABLE IF NOT EXISTS training_course_materials (course_id VARCHAR(64) NOT NULL, material_id VARCHAR(64) NOT NULL, sort_order INT NOT NULL DEFAULT 0, PRIMARY KEY (course_id, material_id), CONSTRAINT training_course_materials_course_fk FOREIGN KEY (course_id) REFERENCES training_courses(id) ON DELETE CASCADE, CONSTRAINT training_course_materials_material_fk FOREIGN KEY (material_id) REFERENCES training_materials(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );

  // One row per employee per Training. Reassigning a completed Training adds a new row (the old
  // completion is kept). Status is worked out: completed_at → Completed; past due → Overdue;
  // started_at → In Progress; otherwise Not Started.
  await database.query(
    "CREATE TABLE IF NOT EXISTS training_assignments (id VARCHAR(64) PRIMARY KEY, course_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, requirement VARCHAR(20) NOT NULL DEFAULT 'Required', due_date DATE NULL, assigned_by VARCHAR(64) NULL, assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, started_at DATETIME NULL, completed_at DATETIME NULL, certificate_number VARCHAR(40) NULL, certificate_expires_on DATE NULL, source VARCHAR(20) NOT NULL DEFAULT 'manual', INDEX training_assignments_user_idx (user_id, completed_at), INDEX training_assignments_course_idx (course_id, completed_at), INDEX training_assignments_due_idx (due_date), CONSTRAINT training_assignments_course_fk FOREIGN KEY (course_id) REFERENCES training_courses(id) ON DELETE CASCADE, CONSTRAINT training_assignments_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  await database.query(
    "CREATE TABLE IF NOT EXISTS training_material_views (assignment_id VARCHAR(64) NOT NULL, material_id VARCHAR(64) NOT NULL, viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (assignment_id, material_id), CONSTRAINT training_material_views_assignment_fk FOREIGN KEY (assignment_id) REFERENCES training_assignments(id) ON DELETE CASCADE, CONSTRAINT training_material_views_material_fk FOREIGN KEY (material_id) REFERENCES training_materials(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );

  // ── Incidents ──
  // number gives the readable INC-2026-0001 reference. Reported At / Reported By are set on
  // submit; Investigation Completed At / Investigated By when the investigation is submitted.
  await database.query(
    "CREATE TABLE IF NOT EXISTS incidents (id VARCHAR(64) PRIMARY KEY, number INT NOT NULL AUTO_INCREMENT UNIQUE, title VARCHAR(255) NOT NULL, description TEXT NOT NULL, category VARCHAR(60) NOT NULL, severity VARCHAR(20) NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'Open', affected_systems VARCHAR(255) NULL, occurred_at DATETIME NULL, reported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, reported_by VARCHAR(64) NULL, assigned_to VARCHAR(64) NULL, related_ticket_id VARCHAR(64) NULL, investigation_started_at DATETIME NULL, investigation_findings TEXT NULL, actions_taken TEXT NULL, final_conclusion TEXT NULL, investigation_completed_at DATETIME NULL, investigated_by VARCHAR(64) NULL, resolved_at DATETIME NULL, closed_at DATETIME NULL, closed_by VARCHAR(64) NULL, close_reason VARCHAR(120) NULL, reopened_count INT NOT NULL DEFAULT 0, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX incidents_status_idx (status, reported_at), INDEX incidents_assignee_idx (assigned_to), INDEX incidents_ticket_idx (related_ticket_id)) ENGINE=InnoDB AUTO_INCREMENT=1"
  );
  await database.query(
    "CREATE TABLE IF NOT EXISTS incident_events (id VARCHAR(64) PRIMARY KEY, incident_id VARCHAR(64) NOT NULL, kind VARCHAR(20) NOT NULL, body VARCHAR(2000) NOT NULL, actor_id VARCHAR(64) NULL, actor_name VARCHAR(255) NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX incident_events_incident_idx (incident_id, created_at), CONSTRAINT incident_events_incident_fk FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  await database.query(
    "CREATE TABLE IF NOT EXISTS incident_files (id VARCHAR(64) PRIMARY KEY, incident_id VARCHAR(64) NOT NULL, file_path VARCHAR(500) NOT NULL, file_name VARCHAR(255) NOT NULL, file_size BIGINT NOT NULL, file_mime VARCHAR(120) NULL, uploaded_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX incident_files_incident_idx (incident_id), CONSTRAINT incident_files_incident_fk FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );

  // ── Evidence repository ──
  // number gives EV-001 style ids. criteria / controls are JSON lists (Trust Service Criteria and
  // SOC 2 control ids). expires_on NULL = Does Not Expire. Every file is a version; uploading a
  // new one keeps the old.
  await database.query(
    "CREATE TABLE IF NOT EXISTS evidence_items (id VARCHAR(64) PRIMARY KEY, number INT NOT NULL AUTO_INCREMENT UNIQUE, title VARCHAR(255) NOT NULL, description TEXT NULL, criteria JSON NOT NULL, controls JSON NOT NULL, owner_id VARCHAR(64) NULL, status VARCHAR(20) NOT NULL DEFAULT 'Draft', evidence_period VARCHAR(80) NULL, expires_on DATE NULL, verification_note VARCHAR(1000) NULL, verified_by VARCHAR(64) NULL, verified_at DATETIME NULL, archived_at DATETIME NULL, created_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX evidence_items_status_idx (status, expires_on)) ENGINE=InnoDB AUTO_INCREMENT=1"
  );
  await database.query(
    "CREATE TABLE IF NOT EXISTS evidence_versions (id VARCHAR(64) PRIMARY KEY, evidence_id VARCHAR(64) NOT NULL, version INT NOT NULL, file_path VARCHAR(500) NOT NULL, file_name VARCHAR(255) NOT NULL, file_size BIGINT NOT NULL, file_mime VARCHAR(120) NULL, note VARCHAR(500) NULL, uploaded_by VARCHAR(64) NULL, uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY evidence_versions_unique (evidence_id, version), CONSTRAINT evidence_versions_item_fk FOREIGN KEY (evidence_id) REFERENCES evidence_items(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );

  // ── SOC 2 readiness ──
  await database.query(
    "CREATE TABLE IF NOT EXISTS soc2_controls (id VARCHAR(20) PRIMARY KEY, criteria VARCHAR(40) NOT NULL, name VARCHAR(255) NOT NULL, priority VARCHAR(10) NOT NULL DEFAULT 'Medium', status VARCHAR(20) NOT NULL DEFAULT 'Not Started', owner_id VARCHAR(64) NULL, due_date DATE NULL, sort_order INT NOT NULL DEFAULT 0, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB"
  );
  for (const [index, control] of SOC2_CONTROL_LIBRARY.entries()) {
    await database.execute("INSERT IGNORE INTO soc2_controls (id, criteria, name, priority, sort_order) VALUES (?, ?, ?, ?, ?)", [control.id, control.criteria, control.name, control.priority, index]);
  }
  // The audit timeline (readiness assessment, evidence freeze, fieldwork, report)
  await database.query(
    "CREATE TABLE IF NOT EXISTS soc2_milestones (id VARCHAR(64) PRIMARY KEY, title VARCHAR(160) NOT NULL, starts_on DATE NULL, ends_on DATE NULL, done_at DATETIME NULL, sort_order INT NOT NULL DEFAULT 0) ENGINE=InnoDB"
  );
  for (const [index, title] of ["Readiness assessment", "Evidence freeze", "Auditor fieldwork", "Report issued"].entries()) {
    await database.execute("INSERT IGNORE INTO soc2_milestones (id, title, sort_order) VALUES (?, ?, ?)", [`soc2_m${index + 1}`, title, index]);
  }
}
