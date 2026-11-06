// Phase 3: Plan & Pricing Control — plan details, promo codes and pricing settings.
// Called from ensureSchema() in lib/db.js (after ensureAccountSchema).
export async function ensurePricingSchema(database, addColumnIfMissing) {
  // Plans: what the Edit Plan dialog manages beyond the catalog columns
  await addColumnIfMissing("plans", "badge", "VARCHAR(40) NULL");
  await addColumnIfMissing("plans", "calibrations_included", "INT NOT NULL DEFAULT 1");
  await addColumnIfMissing("plans", "report_overage_cents", "INT NOT NULL DEFAULT 500");
  await addColumnIfMissing("plans", "updated_at", "DATETIME NULL");

  // Promo codes. discount_type: percent | fixed (cents) | free_reports | free_calls | trial_days.
  // applies_to: JSON list of plan ids, NULL = all paid plans. max_uses NULL = unlimited.
  await database.query(
    "CREATE TABLE IF NOT EXISTS promo_codes (id VARCHAR(64) PRIMARY KEY, code VARCHAR(40) NOT NULL UNIQUE, name VARCHAR(120) NOT NULL, description VARCHAR(500) NULL, discount_type VARCHAR(20) NOT NULL, discount_value INT NOT NULL, applies_to TEXT NULL, billing_cycles VARCHAR(20) NOT NULL DEFAULT 'any', min_purchase_cents INT NOT NULL DEFAULT 0, max_uses INT NULL, per_customer_limit INT NOT NULL DEFAULT 1, stackable TINYINT(1) NOT NULL DEFAULT 0, starts_at DATETIME NULL, expires_at DATETIME NULL, status VARCHAR(20) NOT NULL DEFAULT 'active', created_by VARCHAR(64) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NULL) ENGINE=InnoDB"
  );
  // One row per use (written at checkout once payments are connected)
  await database.query(
    "CREATE TABLE IF NOT EXISTS promo_redemptions (id VARCHAR(64) PRIMARY KEY, promo_id VARCHAR(64) NOT NULL, organization_id VARCHAR(64) NOT NULL, redeemed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX promo_redemptions_promo_idx (promo_id), INDEX promo_redemptions_org_idx (organization_id), CONSTRAINT promo_redemptions_promo_fk FOREIGN KEY (promo_id) REFERENCES promo_codes(id) ON DELETE CASCADE) ENGINE=InnoDB"
  );
  // Trial rules, enterprise defaults, report add-ons and billing rules (one JSON document each)
  await database.query(
    "CREATE TABLE IF NOT EXISTS pricing_settings (setting_key VARCHAR(40) PRIMARY KEY, value TEXT NOT NULL, updated_by VARCHAR(64) NULL, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB"
  );
  // The promo code a subscription was sold with
  await addColumnIfMissing("subscriptions", "promo_code_id", "VARCHAR(64) NULL");
}
