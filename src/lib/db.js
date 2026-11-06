import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import mysql from "mysql2/promise";
import { CATALOG } from "./playbook-catalog.js";
import { PLANS } from "./plan-catalog.js";
import { ensureStaffSchema } from "./schema/staff.js";
import { ensurePipelineSchema } from "./schema/pipeline.js";
import { ensureSupportSchema } from "./schema/support.js";
import { ensureCustomerSchema } from "./schema/customers.js";
import { ensureCalendarSchema } from "./schema/calendar.js";
import { ensureAccountSchema } from "./schema/accounts.js";
import { ensurePricingSchema } from "./schema/pricing.js";
import { ensureTeamSchema } from "./schema/team.js";
import { ensureCampaignSchema } from "./schema/campaigns.js";

const database = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  database: process.env.MYSQL_DATABASE || "pitchprox_dev",
  user: process.env.MYSQL_USER || "pitchprox_app",
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  // Calendar dates (DATE columns) come back as "YYYY-MM-DD" text, so they never shift with time zones
  dateStrings: ["DATE"],
  // Serverless hosts (Vercel) run many copies of the app, so keep each one's pool small there
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
  // Hosted MySQL (Aiven, TiDB Cloud, PlanetScale, Railway…) usually requires an encrypted connection
  ...(process.env.MYSQL_SSL === "true" && { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: process.env.MYSQL_SSL_INSECURE !== "true" } }),
});

let schemaPromise;
async function ensureSchema() {
  if (!schemaPromise) schemaPromise = (async () => {
    await database.query("CREATE TABLE IF NOT EXISTS organizations (id VARCHAR(64) PRIMARY KEY, name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB");
    await database.query("CREATE TABLE IF NOT EXISTS users (id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, password_salt VARCHAR(255) NOT NULL, role VARCHAR(64) NOT NULL DEFAULT 'customer_admin', created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT users_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id)) ENGINE=InnoDB");
    await database.query("CREATE TABLE IF NOT EXISTS sessions (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, token_hash VARCHAR(64) NOT NULL UNIQUE, expires_at DATETIME NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT sessions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
    await database.query("CREATE TABLE IF NOT EXISTS leads (id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, name VARCHAR(255) NOT NULL, email VARCHAR(255), phone_number VARCHAR(64), property_address VARCHAR(500), city VARCHAR(120), state VARCHAR(64), zip_code VARCHAR(32), lead_type VARCHAR(120), stage VARCHAR(80) NOT NULL DEFAULT 'New', status VARCHAR(80) NOT NULL DEFAULT 'Unknown', outcome VARCHAR(120), notes TEXT, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT leads_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id)) ENGINE=InnoDB");
    await database.query("CREATE TABLE IF NOT EXISTS prospects (id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, lead_id VARCHAR(64), name VARCHAR(255) NOT NULL, email VARCHAR(255), phone_number VARCHAR(64), property_address VARCHAR(500), lead_type VARCHAR(120), stage VARCHAR(80) NOT NULL DEFAULT 'New', status VARCHAR(80) NOT NULL DEFAULT 'Unknown', outcome VARCHAR(120), notes TEXT, follow_up_at DATETIME NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT prospects_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id), CONSTRAINT prospects_lead_fk FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL) ENGINE=InnoDB");
    await addColumnIfMissing("prospects", "city", "VARCHAR(120) NULL AFTER property_address");
    await addColumnIfMissing("prospects", "state", "VARCHAR(64) NULL AFTER city");
    await addColumnIfMissing("prospects", "zip_code", "VARCHAR(32) NULL AFTER state");
    await database.query("CREATE TABLE IF NOT EXISTS prospect_notes (id VARCHAR(64) PRIMARY KEY, prospect_id VARCHAR(64) NOT NULL, organization_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, body TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX prospect_notes_prospect_idx (prospect_id, created_at), CONSTRAINT prospect_notes_prospect_fk FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE, CONSTRAINT prospect_notes_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id), CONSTRAINT prospect_notes_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
    await database.query("CREATE TABLE IF NOT EXISTS user_settings (user_id VARCHAR(64) PRIMARY KEY, preferences JSON NOT NULL, notifications JSON NOT NULL, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT user_settings_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
    await database.query("CREATE TABLE IF NOT EXISTS playbooks (id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NULL, kind VARCHAR(20) NOT NULL, title VARCHAR(255) NOT NULL, subtitle VARCHAR(255) NULL, description TEXT NULL, price_cents INT NULL, icon_letter VARCHAR(16) NULL, avatar_url VARCHAR(500) NULL, status VARCHAR(20) NOT NULL DEFAULT 'published', content JSON NULL, created_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX playbooks_organization_idx (organization_id), CONSTRAINT playbooks_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE) ENGINE=InnoDB");
    await database.query("CREATE TABLE IF NOT EXISTS playbook_purchases (organization_id VARCHAR(64) NOT NULL, playbook_id VARCHAR(64) NOT NULL, purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (organization_id, playbook_id), CONSTRAINT playbook_purchases_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE, CONSTRAINT playbook_purchases_playbook_fk FOREIGN KEY (playbook_id) REFERENCES playbooks(id) ON DELETE CASCADE) ENGINE=InnoDB");
    for (const [index, item] of CATALOG.entries()) {
      await database.execute("INSERT IGNORE INTO playbooks (id, kind, title, subtitle, description, price_cents, icon_letter, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD('2024-01-01', INTERVAL ? DAY))", [item.id, item.kind, item.title, item.subtitle ?? null, item.description, item.priceCents ?? null, item.iconLetter ?? null, item.avatarUrl ?? null, index]);
    }
    // Security: device details for sessions, and a sign-in history
    await addColumnIfMissing("sessions", "user_agent", "VARCHAR(500) NULL");
    await addColumnIfMissing("sessions", "ip", "VARCHAR(64) NULL");
    await addColumnIfMissing("sessions", "last_seen_at", "DATETIME NULL");
    await database.query("CREATE TABLE IF NOT EXISTS login_events (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NULL, email VARCHAR(255) NOT NULL, success TINYINT(1) NOT NULL, ip VARCHAR(64) NULL, user_agent VARCHAR(500) NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX login_events_user_idx (user_id, created_at), CONSTRAINT login_events_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
    // Leads: notes and follow-ups (same as prospects)
    await addColumnIfMissing("leads", "follow_up_at", "DATETIME NULL");
    await database.query("CREATE TABLE IF NOT EXISTS lead_notes (id VARCHAR(64) PRIMARY KEY, lead_id VARCHAR(64) NOT NULL, organization_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, body TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX lead_notes_lead_idx (lead_id, created_at), CONSTRAINT lead_notes_lead_fk FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE, CONSTRAINT lead_notes_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id), CONSTRAINT lead_notes_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
    // AI training material uploaded by a company
    await database.query("CREATE TABLE IF NOT EXISTS training_assets (id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, category VARCHAR(64) NOT NULL, name VARCHAR(255) NOT NULL, mime VARCHAR(120) NOT NULL, size_bytes BIGINT NOT NULL, storage_path VARCHAR(500) NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'active', created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX training_assets_organization_idx (organization_id, created_at), CONSTRAINT training_assets_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE, CONSTRAINT training_assets_user_fk FOREIGN KEY (user_id) REFERENCES users(id)) ENGINE=InnoDB");
    // Support tickets; `number` gives the readable #TKT-1001 style id
    await database.query("CREATE TABLE IF NOT EXISTS support_tickets (id VARCHAR(64) PRIMARY KEY, number INT NOT NULL AUTO_INCREMENT UNIQUE, organization_id VARCHAR(64) NOT NULL, created_by VARCHAR(64) NOT NULL, category VARCHAR(40) NOT NULL, priority VARCHAR(20) NOT NULL, subject VARCHAR(255) NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'Open', created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX support_tickets_organization_idx (organization_id, updated_at), CONSTRAINT support_tickets_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE, CONSTRAINT support_tickets_user_fk FOREIGN KEY (created_by) REFERENCES users(id)) ENGINE=InnoDB AUTO_INCREMENT=1001");
    await database.query("CREATE TABLE IF NOT EXISTS support_messages (id VARCHAR(64) PRIMARY KEY, ticket_id VARCHAR(64) NOT NULL, author_id VARCHAR(64) NOT NULL, author_role VARCHAR(20) NOT NULL, body TEXT NOT NULL, attachment_name VARCHAR(255) NULL, attachment_mime VARCHAR(120) NULL, attachment_size BIGINT NULL, attachment_path VARCHAR(500) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX support_messages_ticket_idx (ticket_id, created_at), CONSTRAINT support_messages_ticket_fk FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE, CONSTRAINT support_messages_user_fk FOREIGN KEY (author_id) REFERENCES users(id)) ENGINE=InnoDB");
    // Emails written in the app; delivered once an email service is connected
    await database.query("CREATE TABLE IF NOT EXISTS mail_messages (id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, to_email VARCHAR(255) NOT NULL, cc VARCHAR(1000) NULL, bcc VARCHAR(1000) NULL, subject VARCHAR(255) NOT NULL, body TEXT NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'queued', track_opens TINYINT(1) NOT NULL DEFAULT 1, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX mail_messages_organization_idx (organization_id, created_at), CONSTRAINT mail_messages_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE, CONSTRAINT mail_messages_user_fk FOREIGN KEY (user_id) REFERENCES users(id)) ENGINE=InnoDB");
    // Plans (from the public pricing section), each company's subscription, invoices
    await database.query("CREATE TABLE IF NOT EXISTS plans (id VARCHAR(64) PRIMARY KEY, name VARCHAR(120) NOT NULL, description VARCHAR(500) NULL, price_monthly_cents INT NOT NULL, price_annual_cents INT NOT NULL, calls_per_month INT NOT NULL, reports_per_month INT NOT NULL, overage_cents_per_call INT NOT NULL, is_trial TINYINT(1) NOT NULL DEFAULT 0, sort_order INT NOT NULL DEFAULT 0, active TINYINT(1) NOT NULL DEFAULT 1) ENGINE=InnoDB");
    for (const plan of PLANS) {
      await database.execute("INSERT IGNORE INTO plans (id, name, description, price_monthly_cents, price_annual_cents, calls_per_month, reports_per_month, overage_cents_per_call, is_trial, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [plan.id, plan.name, plan.description, plan.priceMonthlyCents, plan.priceAnnualCents, plan.callsPerMonth, plan.reportsPerMonth, plan.overageCentsPerCall, plan.isTrial ? 1 : 0, plan.sortOrder]);
    }
    await database.query("CREATE TABLE IF NOT EXISTS subscriptions (organization_id VARCHAR(64) PRIMARY KEY, plan_id VARCHAR(64) NOT NULL, status VARCHAR(20) NOT NULL, billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly', current_period_start DATETIME NOT NULL, current_period_end DATETIME NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT subscriptions_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE, CONSTRAINT subscriptions_plan_fk FOREIGN KEY (plan_id) REFERENCES plans(id)) ENGINE=InnoDB");
    await database.query("CREATE TABLE IF NOT EXISTS invoices (id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, number VARCHAR(40) NOT NULL, description VARCHAR(255) NOT NULL, amount_cents INT NOT NULL, status VARCHAR(20) NOT NULL, issued_at DATETIME NOT NULL, INDEX invoices_organization_idx (organization_id, issued_at), CONSTRAINT invoices_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE) ENGINE=InnoDB");
    // Completed microphone calibration sessions
    await database.query("CREATE TABLE IF NOT EXISTS calibration_sessions (id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, rounds_completed INT NULL, duration_seconds INT NOT NULL, completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX calibration_sessions_user_idx (user_id, completed_at), CONSTRAINT calibration_sessions_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE, CONSTRAINT calibration_sessions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
    // Newer areas keep their tables in lib/schema/* to keep this file readable
    await ensureStaffSchema(database);
    await ensurePipelineSchema(database, addColumnIfMissing);
    await ensureSupportSchema(database, addColumnIfMissing);
    await ensureCustomerSchema(database);
    await ensureCalendarSchema(database);
    await ensureAccountSchema(database, addColumnIfMissing);
    await ensurePricingSchema(database, addColumnIfMissing);
    await ensureTeamSchema(database);
    await ensureCampaignSchema(database);
  })();
  // A failed attempt (e.g. MySQL not running yet) must be retried on the next query
  schemaPromise.catch(() => { schemaPromise = undefined; });
  return schemaPromise;
}

// CREATE TABLE IF NOT EXISTS never alters an existing table, so columns added
// later are applied here for databases created by an earlier version.
async function addColumnIfMissing(table, column, definition) {
  const [rows] = await database.execute("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?", [table, column]);
  if (!rows.length) await database.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

export async function query(sql, values = []) {
  await ensureSchema();
  const [rows] = await database.execute(sql, values);
  return rows;
}

export const createId = (prefix) => `${prefix}_${randomBytes(12).toString("hex")}`;
export const hashToken = (token) => createHash("sha256").update(token).digest("hex");
export function hashPassword(password) { const salt = randomBytes(16).toString("hex"); return { salt, hash: scryptSync(password, salt, 64).toString("hex") }; }
export function verifyPassword(password, salt, expectedHash) { const actual = scryptSync(password, salt, 64); const expected = Buffer.from(expectedHash, "hex"); return actual.length === expected.length && timingSafeEqual(actual, expected); }
export default database;
