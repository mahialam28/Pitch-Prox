import { withApi } from "@/lib/api";
import { requireCompliance } from "@/lib/compliance/policies";
import { evidenceFile } from "@/lib/compliance/evidence";

export const runtime = "nodejs";

// The latest file, or ?version=<id>; ?inline=1 opens PDFs and images in the browser
export const GET = withApi(async (request, { params }) => {
  await requireCompliance();
  const { evidenceId } = await params;
  const search = new URL(request.url).searchParams;
  const file = await evidenceFile(evidenceId, search.get("version"));
  const inline = search.get("inline") === "1" && /^(application\/pdf|image\/(png|jpeg))$/.test(file.mime);
  return new Response(file.bytes, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
});
