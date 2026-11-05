import { ApiError } from "@/lib/api";

// ── List endpoints: paging, search and sorting ──
// Reads ?page=&pageSize=&search=&sort=&dir= with safe limits. `sortable` maps
// the public sort names to SQL columns, so user input never reaches SQL directly.
export function listParams(searchParams, { sortable = {}, defaultSort, defaultDir = "desc", maxPageSize = 100 } = {}) {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(maxPageSize, Math.max(1, Number.parseInt(searchParams.get("pageSize") ?? "10", 10) || 10));
  const search = (searchParams.get("search") ?? "").trim().slice(0, 120);
  const sortKey = searchParams.get("sort") ?? defaultSort;
  if (sortKey && !sortable[sortKey]) throw new ApiError("Unknown sort field.");
  const dir = (searchParams.get("dir") ?? defaultDir).toLowerCase() === "asc" ? "ASC" : "DESC";
  return { page, pageSize, offset: (page - 1) * pageSize, search, orderBy: sortKey ? `${sortable[sortKey]} ${dir}` : null };
}

// Standard list response
export const paged = (results, total, { page, pageSize }) => ({ results, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) });

// LIKE pattern with the wildcards in the user's text escaped
export const likePattern = (text) => `%${text.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
