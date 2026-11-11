import { withApi } from "@/lib/api";
import { getVersion, listVersions, requireBuilder } from "@/lib/playbook-builder";
import { aiPlaybook } from "@/lib/playbook-runtime";

export const runtime = "nodejs";

// The AI-safe export of a published version, for the AI developer (Spec 12 structure, without
// commercial and internal fields). ?version=N (default: the version in force). Downloads as JSON.
export const GET = withApi(async (request, { params }) => {
  await requireBuilder();
  const { playbookId } = await params;
  const requested = new URL(request.url).searchParams.get("version");
  const version = requested ?? (await listVersions(playbookId)).playbook.version;
  const { playbook } = await getVersion(playbookId, version);
  const body = JSON.stringify(aiPlaybook(playbook), null, 2);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${playbookId}-v${version}-ai.json"`,
      "Cache-Control": "no-store",
    },
  });
});
