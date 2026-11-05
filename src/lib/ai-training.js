import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { CUSTOMER_ROLES } from "@/utils.js/roles";

// Customers share training material across their company; each sales rep keeps their own
const ownerScope = (user) =>
  CUSTOMER_ROLES.includes(user.role)
    ? { sql: "training_assets.organization_id = ?", values: [user.organizationId] }
    : { sql: "training_assets.organization_id = ? AND training_assets.user_id = ?", values: [user.organizationId, user.id] };
import { deleteUpload, formatBytes, saveUpload } from "@/lib/storage";
import { TRAINING_CATEGORIES, TRAINING_FILE_TYPES, TRAINING_MAX_BYTES } from "@/utils.js/ai-training";

const ALLOWED = Object.values(TRAINING_FILE_TYPES).flat();
const typeLabel = (name) => {
  const extension = name.split(".").pop().toLowerCase();
  return Object.keys(TRAINING_FILE_TYPES).find((label) => TRAINING_FILE_TYPES[label].includes(extension)) ?? "File";
};
const categoryTitle = (id) => TRAINING_CATEGORIES.find((category) => category.id === id)?.title ?? id;

const present = (row) => ({
  id: row.id,
  name: row.name,
  categoryId: row.category,
  category: categoryTitle(row.category),
  type: typeLabel(row.name),
  size: formatBytes(Number(row.size_bytes)),
  status: row.status === "paused" ? "Paused" : "Active",
  uploadedBy: row.uploaded_by,
  createdAt: row.created_at,
});

// Material list plus how many of the 7 categories have active material
export async function listTrainingAssets(user) {
  const scope = ownerScope(user);
  const rows = await query(`SELECT training_assets.*, users.name AS uploaded_by FROM training_assets JOIN users ON users.id = training_assets.user_id WHERE ${scope.sql} ORDER BY training_assets.created_at DESC`, scope.values);
  const covered = new Set(rows.filter((row) => row.status === "active").map((row) => row.category));
  return {
    results: rows.map(present),
    summary: {
      coveredCategories: covered.size,
      totalCategories: TRAINING_CATEGORIES.length,
      progress: Math.round((covered.size / TRAINING_CATEGORIES.length) * 100),
      lastUpdated: rows[0]?.created_at ?? null,
    },
  };
}

export async function addTrainingAsset(user, form) {
  const category = form.get("category");
  if (!TRAINING_CATEGORIES.some((item) => item.id === category)) throw new ApiError("Choose a valid training category.");
  const file = await saveUpload(user.organizationId, form.get("file"), { maxBytes: TRAINING_MAX_BYTES, allowed: ALLOWED });
  const id = createId("asset");
  await query("INSERT INTO training_assets (id, organization_id, user_id, category, name, mime, size_bytes, storage_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [id, user.organizationId, user.id, category, file.name, file.mime, file.size, file.storagePath]);
  const [row] = await query("SELECT training_assets.*, users.name AS uploaded_by FROM training_assets JOIN users ON users.id = training_assets.user_id WHERE training_assets.id = ?", [id]);
  return present(row);
}

async function findAsset(user, id) {
  const scope = ownerScope(user);
  const [row] = await query(`SELECT * FROM training_assets WHERE training_assets.id = ? AND ${scope.sql}`, [id, ...scope.values]);
  if (!row) throw new ApiError("Training material not found.", 404);
  return row;
}

// Paused material stays stored but is left out when the AI learns
export async function setTrainingAssetStatus(user, id, status) {
  if (!["active", "paused"].includes(status)) throw new ApiError("Status must be active or paused.");
  await findAsset(user, id);
  await query("UPDATE training_assets SET status = ? WHERE id = ? AND organization_id = ?", [status, id, user.organizationId]);
}

export async function deleteTrainingAsset(user, id) {
  const row = await findAsset(user, id);
  await query("DELETE FROM training_assets WHERE id = ? AND organization_id = ?", [id, user.organizationId]);
  await deleteUpload(row.storage_path);
}

// Rename the display name. The original extension is kept so the file type stays correct.
export async function renameTrainingAsset(user, id, name) {
  const row = await findAsset(user, id);
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) throw new ApiError("Enter a file name.");
  const extension = row.name.includes(".") ? `.${row.name.split(".").pop()}` : "";
  const finalName = (trimmed.toLowerCase().endsWith(extension.toLowerCase()) ? trimmed : `${trimmed}${extension}`).slice(0, 255);
  await query("UPDATE training_assets SET name = ? WHERE id = ? AND organization_id = ?", [finalName, id, user.organizationId]);
  return finalName;
}

// The stored file, for downloading
export async function readTrainingAsset(user, id) {
  const row = await findAsset(user, id);
  return { name: row.name, mime: row.mime, storagePath: row.storage_path };
}
