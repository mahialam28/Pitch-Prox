// Playbook Builder (Super Admin → Playbook). A build is the builder's working copy of a platform
// playbook: the whole form (all 7 steps) as JSON, the step the editor was on, and a revision number
// that rises on every save (a save based on an older revision is refused, so two editors can't
// silently overwrite each other). playbook_id links a build to the platform playbook it edits.
// Uploaded files (cover image, assets, voice audio) live in playbook_build_files.
// Called from ensureSchema() in lib/db.js. Relative imports only (CLI scripts load this file).
export async function ensurePlaybookBuilderSchema(database, addColumnIfMissing) {
  await database.query(
    "CREATE TABLE IF NOT EXISTS playbook_builds (id VARCHAR(64) PRIMARY KEY, playbook_id VARCHAR(64) NULL, title VARCHAR(255) NOT NULL DEFAULT '', status VARCHAR(20) NOT NULL DEFAULT 'draft', content JSON NOT NULL, current_step INT NOT NULL DEFAULT 1, revision INT NOT NULL DEFAULT 1, created_by VARCHAR(64) NULL, updated_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX playbook_builds_playbook_idx (playbook_id), INDEX playbook_builds_updated_idx (status, updated_at)) ENGINE=InnoDB"
  );
  await database.query(
    "CREATE TABLE IF NOT EXISTS playbook_build_files (id VARCHAR(64) PRIMARY KEY, purpose VARCHAR(20) NOT NULL, file_path VARCHAR(500) NOT NULL, file_name VARCHAR(255) NOT NULL, file_size BIGINT NOT NULL, file_mime VARCHAR(120) NULL, uploaded_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB"
  );

  // ── Publishing (build phase 2) ──
  // Every publish freezes an immutable version: `content` is the compiled PremiumPlaybook object
  // (Spec 12 §5) and `source` the builder form it came from (to start the next draft). Versions
  // only go up; a rollback re-publishes an earlier version's content as a new number.
  await database.query(
    "CREATE TABLE IF NOT EXISTS playbook_versions (id VARCHAR(64) PRIMARY KEY, playbook_id VARCHAR(64) NOT NULL, version INT NOT NULL, content JSON NOT NULL, source JSON NOT NULL, release_notes VARCHAR(2000) NULL, changed_sections JSON NULL, warnings_acknowledged JSON NULL, rolled_back_from INT NULL, build_id VARCHAR(64) NULL, published_by VARCHAR(64) NULL, published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY playbook_versions_unique (playbook_id, version), CONSTRAINT playbook_versions_playbook_fk FOREIGN KEY (playbook_id) REFERENCES playbooks(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // The version in force for each platform playbook, and who can see it
  // (visibility: private | team | organization | marketplace; NULL = the seeded playbooks, shown to everyone)
  await addColumnIfMissing("playbooks", "active_version_id", "VARCHAR(64) NULL");
  await addColumnIfMissing("playbooks", "version", "INT NULL");
  await addColumnIfMissing("playbooks", "visibility", "VARCHAR(20) NULL");
  await addColumnIfMissing("playbooks", "published_at", "DATETIME NULL");
  // The version a draft started from, and the version it became
  await addColumnIfMissing("playbook_builds", "base_version", "INT NULL");
  await addColumnIfMissing("playbook_builds", "published_version_id", "VARCHAR(64) NULL");

  // ── Resource Library (build phase 4) ──
  // Resources pinned once and reused by any playbook (Spec 12 §6.5). Importing copies the resource
  // into the playbook with library_id kept as a link; removing from the library hides it from
  // imports without touching playbooks that already use it.
  await database.query(
    "CREATE TABLE IF NOT EXISTS playbook_resource_library (id VARCHAR(64) PRIMARY KEY, name VARCHAR(160) NOT NULL, type VARCHAR(40) NOT NULL, description VARCHAR(500) NULL, content MEDIUMTEXT NULL, icon_color VARCHAR(20) NULL, file JSON NULL, added_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, removed_at DATETIME NULL, INDEX playbook_resource_library_list_idx (removed_at, created_at)) ENGINE=InnoDB"
  );
  // Phase 8: Email Template purpose + subject, Follow Up kind + template purpose
  await addColumnIfMissing("playbook_resource_library", "follow_up", "JSON NULL");
}
