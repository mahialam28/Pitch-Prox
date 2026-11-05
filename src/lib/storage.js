import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { ApiError } from "@/lib/api";

// ── Uploaded files ──
// Stored on the server's disk under storage/uploads/<organization>/ (outside
// the public web folder), so they're only reachable through authorized API
// routes. Set UPLOAD_DIR to keep them somewhere else. Back this folder up
// together with the database.
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "storage", "uploads");

export const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// Save one uploaded File; `allowed` is a list of lower-case extensions
export async function saveUpload(organizationId, file, { maxBytes, allowed }) {
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") throw new ApiError("Choose a file to upload.");
  if (!file.size) throw new ApiError("The file is empty.");
  if (file.size > maxBytes) throw new ApiError(`Files must be ${formatBytes(maxBytes)} or smaller.`);
  const extension = path.extname(file.name || "").slice(1).toLowerCase();
  if (!allowed.includes(extension)) throw new ApiError(`That file type isn't supported. Use: ${allowed.join(", ")}.`);
  // Server-chosen name: the original name is only kept for display
  const relative = path.join(organizationId, `${randomBytes(16).toString("hex")}.${extension}`);
  await mkdir(path.join(/*turbopackIgnore: true*/ UPLOAD_ROOT, organizationId), { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ UPLOAD_ROOT, relative), Buffer.from(await file.arrayBuffer()));
  return { storagePath: relative, name: path.basename(file.name).slice(0, 255), size: file.size, mime: file.type || "application/octet-stream", extension };
}

// Only paths this module created are ever read, so they can't escape the root
const resolveStored = (relative) => {
  const full = path.resolve(/*turbopackIgnore: true*/ UPLOAD_ROOT, relative);
  if (!full.startsWith(path.resolve(/*turbopackIgnore: true*/ UPLOAD_ROOT) + path.sep)) throw new ApiError("File not found.", 404);
  return full;
};

export async function readUpload(relative) {
  try { return await readFile(/*turbopackIgnore: true*/ resolveStored(relative)); } catch { throw new ApiError("File not found.", 404); }
}

export async function deleteUpload(relative) {
  try { await unlink(/*turbopackIgnore: true*/ resolveStored(relative)); } catch { /* already gone */ }
}

// Read a multipart form body, turning a malformed one into a 400
export async function readForm(request) {
  try { return await request.formData(); } catch { throw new ApiError("Invalid upload."); }
}
