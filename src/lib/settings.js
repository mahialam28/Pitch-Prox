import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { ApiError, readJson, withApi } from "@/lib/api";

const parse = (value) => (typeof value === "string" ? JSON.parse(value) : value) || {};

// Read one JSON column of user_settings, merged over its defaults
export async function loadSettings(userId, column, defaults) {
  const [row] = await query("SELECT preferences, notifications FROM user_settings WHERE user_id = ?", [userId]);
  return { ...defaults, ...(row ? parse(row[column]) : {}) };
}

// Merge changes into one JSON column of user_settings
export async function saveSettings(userId, column, defaults, changes) {
  const value = JSON.stringify({ ...(await loadSettings(userId, column, defaults)), ...changes });
  const other = column === "preferences" ? "notifications" : "preferences";
  await query(`INSERT INTO user_settings (user_id, ${column}, ${other}) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ${column} = VALUES(${column})`, [userId, value, "{}"]);
  return JSON.parse(value);
}

// GET/PUT handlers for one JSON column of user_settings. Stored values are
// merged over the defaults, and only keys accepted by `validate` are saved.
export function settingsRoute(column, defaults, validate) {
  const load = (userId) => loadSettings(userId, column, defaults);
  return {
    GET: withApi(async () => {
      const user = await requireCurrentUser();
      return NextResponse.json({ [column]: await load(user.id) });
    }),
    PUT: withApi(async (request) => {
      const user = await requireCurrentUser();
      const body = await readJson(request);
      const updates = {};
      for (const key of Object.keys(defaults)) {
        if (body[key] === undefined) continue;
        if (!validate[key](body[key])) throw new ApiError(`Invalid value for ${key}.`);
        updates[key] = body[key];
      }
      return NextResponse.json({ [column]: await saveSettings(user.id, column, defaults, updates) });
    }),
  };
}
