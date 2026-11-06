import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { listParams } from "@/lib/listing";
import { repActivity, requireTeamSection } from "@/lib/sales-team";

export const runtime = "nodejs";

// ?category=Accounts|Support|Profile|Coaching|Onboarding&performedBy=self|others&page=&pageSize=
export const GET = withApi(async (request, { params }) => {
  await requireTeamSection();
  const { searchParams } = new URL(request.url);
  const paging = listParams(searchParams);
  return NextResponse.json(await repActivity((await params).repId, { ...paging, category: searchParams.get("category") || null, performedBy: searchParams.get("performedBy") || null }));
});
