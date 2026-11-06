import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { listQuotas, requireTeamSection, setQuotas } from "@/lib/sales-team";

export const runtime = "nodejs";

// Monthly revenue quotas. ?month=YYYY-MM (default: this month)
export const GET = withApi(async (request) => {
  await requireTeamSection();
  const month = new URL(request.url).searchParams.get("month") || undefined;
  return NextResponse.json(await listQuotas({ month }));
});

// { month?, quotas: [{ userId, quotaCents }] } — applies from that month onward
export const PUT = withApi(async (request) => {
  const user = await requireTeamSection({ write: true });
  return NextResponse.json(await setQuotas(user, await readJson(request)));
});
