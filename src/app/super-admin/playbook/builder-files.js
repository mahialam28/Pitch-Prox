import { apiRequest } from "@/lib/client-api";

// Upload a file for the Playbook Builder (purpose: "cover" | "asset" | "audio").
// Returns { id, name, size, type, url }; the url is what the playbook stores.
export async function uploadBuilderFile(file, purpose) {
  const body = new FormData();
  body.append("purpose", purpose);
  body.append("file", file);
  const { file: saved } = await apiRequest("/api/v1/admin/playbook-builds/files", { method: "POST", body });
  return saved;
}
