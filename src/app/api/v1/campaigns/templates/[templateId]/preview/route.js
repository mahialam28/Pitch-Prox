import { withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { getTemplate, renderTemplate } from "@/lib/campaigns/templates";
import { loadProfiles } from "@/lib/campaigns/profiles";

export const runtime = "nodejs";

// The email as a customer would see it (?userId= to preview for a real user; otherwise sample values)
export const GET = withApi(async (request, { params }) => {
  await requireCampaigns();
  const template = await getTemplate((await params).templateId);
  const userId = new URL(request.url).searchParams.get("userId");
  const [profile] = userId ? await loadProfiles({ userIds: [userId] }) : [];
  const sample = profile ?? { name: "Jordan Lee", email: "jordan@example.com", company: "Lee Realty", plan: "Pro", trialEnd: null, callsRemaining: 120 };
  const { subject, html } = await renderTemplate(template, sample, { preview: true });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "X-Email-Subject": encodeURIComponent(subject), "Content-Security-Policy": "script-src 'none'; frame-ancestors 'self'" } });
});
