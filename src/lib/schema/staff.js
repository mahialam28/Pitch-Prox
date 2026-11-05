import { ONBOARDING_COURSE, POLICIES } from "../catalogs/onboarding-catalog.js";

// Staff roles (kept in sync with utils.js/roles STAFF_ROLES; listed here so CLI scripts can load this file)
const STAFF_ROLES = ["super_admin", "admin_manager", "support", "auditor", "sales_rep"];

// Tables for PitchProX employees: staff profiles, invites, the audit log,
// policies + acknowledgments, training, onboarding progress and offboarding.
// Called from ensureSchema() in lib/db.js. Relative imports only (CLI scripts load this).
export async function ensureStaffSchema(database) {
  // Employee details for staff users (customers don't have one).
  // employee_number gives the readable EMP-1001 style id.
  await database.query(
    "CREATE TABLE IF NOT EXISTS staff_profiles (user_id VARCHAR(64) PRIMARY KEY, employee_number INT NOT NULL AUTO_INCREMENT UNIQUE, department VARCHAR(80) NULL, job_title VARCHAR(120) NULL, manager_id VARCHAR(64) NULL, phone VARCHAR(64) NULL, timezone VARCHAR(80) NULL, language VARCHAR(40) NULL, start_date DATE NULL, onboarding_due DATE NULL, status VARCHAR(20) NOT NULL DEFAULT 'invited', mfa_method VARCHAR(20) NULL, password_set TINYINT(1) NOT NULL DEFAULT 1, invited_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX staff_profiles_status_idx (status), CONSTRAINT staff_profiles_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, CONSTRAINT staff_profiles_manager_fk FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL) ENGINE=InnoDB AUTO_INCREMENT=1001"
  );

  // Staff created before profiles existed (or by an older create-user) count as active employees
  await database.query(
    `INSERT IGNORE INTO staff_profiles (user_id, status, password_set, start_date, department) SELECT id, 'active', 1, DATE(created_at), CASE WHEN role = 'sales_rep' THEN 'Sales' ELSE NULL END FROM users WHERE role IN (${STAFF_ROLES.map(() => "?").join(", ")}) AND id NOT IN (SELECT user_id FROM staff_profiles)`,
    STAFF_ROLES
  );

  // One-time activation links for invited employees (only the hash is stored)
  await database.query(
    "CREATE TABLE IF NOT EXISTS staff_invites (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, token_hash VARCHAR(64) NOT NULL UNIQUE, expires_at DATETIME NOT NULL, accepted_at DATETIME NULL, created_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX staff_invites_user_idx (user_id, created_at), CONSTRAINT staff_invites_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );

  // Who changed what. actor_name is copied so entries stay readable after a user is deleted.
  await database.query(
    "CREATE TABLE IF NOT EXISTS audit_logs (id VARCHAR(64) PRIMARY KEY, actor_id VARCHAR(64) NULL, actor_name VARCHAR(255) NULL, actor_role VARCHAR(40) NULL, organization_id VARCHAR(64) NULL, action VARCHAR(80) NOT NULL, entity_type VARCHAR(40) NULL, entity_id VARCHAR(64) NULL, summary VARCHAR(500) NOT NULL, metadata JSON NULL, ip VARCHAR(64) NULL, user_agent VARCHAR(500) NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX audit_logs_created_idx (created_at), INDEX audit_logs_entity_idx (entity_type, entity_id), INDEX audit_logs_actor_idx (actor_id, created_at), INDEX audit_logs_action_idx (action, created_at), CONSTRAINT audit_logs_actor_fk FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL) ENGINE=InnoDB"
  );

  // Company and AI policies employees must acknowledge (versioned)
  await database.query(
    "CREATE TABLE IF NOT EXISTS policy_documents (id VARCHAR(64) PRIMARY KEY, title VARCHAR(255) NOT NULL, category VARCHAR(20) NOT NULL, version VARCHAR(20) NOT NULL, effective_date DATE NULL, icon VARCHAR(40) NULL, body JSON NOT NULL, required TINYINT(1) NOT NULL DEFAULT 1, status VARCHAR(20) NOT NULL DEFAULT 'published', sort_order INT NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB"
  );
  for (const [index, policy] of POLICIES.entries()) {
    await database.execute(
      "INSERT IGNORE INTO policy_documents (id, title, category, version, effective_date, icon, body, sort_order) VALUES (?, ?, ?, ?, '2024-04-15', ?, ?, ?)",
      [policy.id, policy.title, policy.category, policy.version, policy.icon, JSON.stringify(policy.body), index]
    );
  }
  await database.query(
    "CREATE TABLE IF NOT EXISTS policy_acknowledgments (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, policy_id VARCHAR(64) NOT NULL, version VARCHAR(20) NOT NULL, signature_name VARCHAR(255) NOT NULL, ip VARCHAR(64) NULL, user_agent VARCHAR(500) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY policy_ack_unique (user_id, policy_id, version), INDEX policy_ack_policy_idx (policy_id, version), CONSTRAINT policy_ack_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, CONSTRAINT policy_ack_policy_fk FOREIGN KEY (policy_id) REFERENCES policy_documents(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );

  // Training courses, their modules, and each employee's progress
  await database.query(
    "CREATE TABLE IF NOT EXISTS training_courses (id VARCHAR(64) PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT NULL, category VARCHAR(80) NULL, minutes INT NULL, resources JSON NULL, required_for_onboarding TINYINT(1) NOT NULL DEFAULT 0, status VARCHAR(20) NOT NULL DEFAULT 'published', created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB"
  );
  await database.query(
    "CREATE TABLE IF NOT EXISTS training_course_modules (id VARCHAR(64) PRIMARY KEY, course_id VARCHAR(64) NOT NULL, title VARCHAR(255) NOT NULL, minutes INT NULL, sort_order INT NOT NULL DEFAULT 0, INDEX training_modules_course_idx (course_id, sort_order), CONSTRAINT training_modules_course_fk FOREIGN KEY (course_id) REFERENCES training_courses(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  await database.execute(
    "INSERT IGNORE INTO training_courses (id, title, description, category, minutes, resources, required_for_onboarding) VALUES (?, ?, ?, ?, ?, ?, 1)",
    [ONBOARDING_COURSE.id, ONBOARDING_COURSE.title, ONBOARDING_COURSE.description, ONBOARDING_COURSE.category, ONBOARDING_COURSE.minutes, JSON.stringify(ONBOARDING_COURSE.resources)]
  );
  for (const [index, trainingModule] of ONBOARDING_COURSE.modules.entries()) {
    await database.execute("INSERT IGNORE INTO training_course_modules (id, course_id, title, minutes, sort_order) VALUES (?, ?, ?, ?, ?)", [trainingModule.id, ONBOARDING_COURSE.id, trainingModule.title, trainingModule.minutes, index]);
  }
  await database.query(
    "CREATE TABLE IF NOT EXISTS training_module_progress (user_id VARCHAR(64) NOT NULL, module_id VARCHAR(64) NOT NULL, completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, module_id), CONSTRAINT training_progress_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, CONSTRAINT training_progress_module_fk FOREIGN KEY (module_id) REFERENCES training_course_modules(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );

  // Onboarding progress per employee (one row; each step stamps its own column)
  await database.query(
    "CREATE TABLE IF NOT EXISTS onboarding_records (user_id VARCHAR(64) PRIMARY KEY, started_at DATETIME NULL, policies_done_at DATETIME NULL, ethics_done_at DATETIME NULL, security_done_at DATETIME NULL, training_done_at DATETIME NULL, final_signed_at DATETIME NULL, final_signature VARCHAR(255) NULL, final_employee_id VARCHAR(40) NULL, final_ip VARCHAR(64) NULL, final_user_agent VARCHAR(500) NULL, voice_done_at DATETIME NULL, completed_at DATETIME NULL, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT onboarding_records_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );

  // Offboarding: one case per departing employee, plus its checklist ticks
  await database.query(
    "CREATE TABLE IF NOT EXISTS offboarding_cases (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, last_day DATE NOT NULL, owner_id VARCHAR(64) NULL, reason VARCHAR(255) NULL, status VARCHAR(20) NOT NULL DEFAULT 'pending', created_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, completed_at DATETIME NULL, INDEX offboarding_cases_status_idx (status, last_day), CONSTRAINT offboarding_cases_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, CONSTRAINT offboarding_cases_owner_fk FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL) ENGINE=InnoDB"
  );
  await database.query(
    "CREATE TABLE IF NOT EXISTS offboarding_case_steps (case_id VARCHAR(64) NOT NULL, step_key VARCHAR(40) NOT NULL, done_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, done_by VARCHAR(64) NULL, PRIMARY KEY (case_id, step_key), CONSTRAINT offboarding_steps_case_fk FOREIGN KEY (case_id) REFERENCES offboarding_cases(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
}
