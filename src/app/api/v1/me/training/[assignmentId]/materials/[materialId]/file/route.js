import { withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { materialFile, viewMaterial } from "@/lib/compliance/training";

export const runtime = "nodejs";

// Open a material of my Training (records it as viewed). PDFs and videos open in the browser.
export const GET = withApi(async (_request, { params }) => {
  const user = await requireStaff();
  const { assignmentId, materialId } = await params;
  await viewMaterial(user, assignmentId, materialId);
  const file = await materialFile(materialId);
  const inline = /^(application\/pdf|video\/)/.test(file.mime);
  return new Response(file.bytes, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
});
