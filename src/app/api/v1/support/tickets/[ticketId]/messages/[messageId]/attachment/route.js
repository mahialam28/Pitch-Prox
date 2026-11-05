import { requireRole } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { readUpload } from "@/lib/storage";
import { customerAttachment } from "@/lib/support";
import { CUSTOMER_ROLES, STAFF_ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// Downloads the file attached to a ticket message
export const GET = withApi(async (_request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ...STAFF_ROLES); const { ticketId, messageId } = await params;
  const file = await customerAttachment(user, ticketId, messageId);
  return new Response(await readUpload(file.path), {
    headers: {
      "Content-Type": file.mime || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
});
