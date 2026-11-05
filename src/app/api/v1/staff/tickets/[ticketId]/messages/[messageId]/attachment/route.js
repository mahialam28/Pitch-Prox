import { withApi } from "@/lib/api";
import { readUpload } from "@/lib/storage";
import { requireSupportAgent, staffAttachment } from "@/lib/support-staff";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  await requireSupportAgent();
  const { ticketId, messageId } = await params;
  const file = await staffAttachment(ticketId, messageId);
  return new Response(await readUpload(file.path), {
    headers: {
      "Content-Type": file.mime || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
});
