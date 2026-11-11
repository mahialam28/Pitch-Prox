import { withApi } from "@/lib/api";
import { policyFile, requireCompliance } from "@/lib/compliance/policies";

export const runtime = "nodejs";

// The file of a version (?version=<id>, default: the one in force). ?inline=1 opens a PDF in the browser.
export const GET = withApi(async (request, { params }) => {
  const user = await requireCompliance();
  const { policyId } = await params;
  const search = new URL(request.url).searchParams;
  const file = await policyFile(user, policyId, search.get("version"));
  const inline = search.get("inline") === "1" && file.mime === "application/pdf";
  return new Response(file.bytes, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
});
