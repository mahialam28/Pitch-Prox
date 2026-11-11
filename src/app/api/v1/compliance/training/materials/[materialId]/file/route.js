import { withApi } from "@/lib/api";
import { requireCompliance } from "@/lib/compliance/policies";
import { materialFile } from "@/lib/compliance/training";

export const runtime = "nodejs";

// The material's file; ?inline=1 opens PDFs and videos in the browser
export const GET = withApi(async (request, { params }) => {
  await requireCompliance();
  const { materialId } = await params;
  const file = await materialFile(materialId);
  const inline = new URL(request.url).searchParams.get("inline") === "1" && /^(application\/pdf|video\/)/.test(file.mime);
  return new Response(file.bytes, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
});
