import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { getRepDetail, requireTeamSection, updateRep } from "@/lib/sales-team";

export const runtime = "nodejs";

export const GET = withApi(async (request, { params }) => {
  const user = await requireTeamSection();
  const month = new URL(request.url).searchParams.get("month") || undefined;
  return NextResponse.json(await getRepDetail(user, (await params).repId, { month }));
});

// { name?, jobTitle?, managerId?, phone?, timezone?, language?, status?: "active" | "deactivated" }
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireTeamSection({ write: true });
  return NextResponse.json({ rep: await updateRep(user, (await params).repId, await readJson(request)) });
});
