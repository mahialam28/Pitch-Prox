import { withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { policyFile } from "@/lib/compliance/policies";

export const runtime = "nodejs";

// The file of the version in force, for any employee (opens PDFs in the browser)
export const GET = withApi(async (_request, { params }) => {
  const user = await requireStaff();
  const { policyId } = await params;
  const file = await policyFile(user, policyId, null, { employeeOnly: true });
  return new Response(file.bytes, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `${file.mime === "application/pdf" ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
});
