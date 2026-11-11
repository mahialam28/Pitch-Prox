import { ROLES } from "@/utils.js/roles";
import { listPolicies } from "@/lib/compliance/policies";
import { trainingOverview } from "@/lib/compliance/training";
import { listIncidents } from "@/lib/compliance/incidents";
import { listEvidence } from "@/lib/compliance/evidence";
import { soc2Overview } from "@/lib/compliance/soc2";

// ── Compliance Overview ──
// Built from the other Compliance pages, so every number matches what they show.
// Compliance Score = the average of: policy acknowledgment rate, training completion,
// verified evidence share and SOC 2 readiness (each only when there's something to measure).

const DAY = 86400000;
const BASE = "/super-admin/compliance-audit";

export async function complianceOverview(user) {
  const [policies, training, incidents, evidence, soc2] = await Promise.all([listPolicies(user), trainingOverview(user), listIncidents(user), listEvidence(user), soc2Overview(user)]);
  const ackRate = policies.stats.acknowledgment.rate;
  const trainingRate = training.stats.total ? Math.round((training.stats.completed / training.stats.total) * 100) : null;
  const evidenceRate = evidence.stats.total ? Math.round((evidence.stats.verified / evidence.stats.total) * 100) : null;
  const parts = [ackRate, trainingRate, evidenceRate, soc2.kpis.readiness].filter((value) => value !== null && value !== undefined);
  const score = parts.length ? Math.round(parts.reduce((sum, value) => sum + value, 0) / parts.length) : null;

  // Posture by policy area: signature rate of its policies, review dates kept
  const live = policies.results.filter((policy) => policy.statusKey === "published");
  const areas = [...new Set(live.map((policy) => policy.category))].sort().map((area) => {
    const list = live.filter((policy) => policy.category === area);
    const signed = list.reduce((sum, policy) => sum + (policy.acknowledgment?.acknowledged ?? 0), 0);
    const needed = list.reduce((sum, policy) => sum + (policy.acknowledgment?.total ?? 0), 0);
    const rate = needed ? Math.round((signed / needed) * 100) : 100;
    const reviewsDue = list.filter((policy) => policy.reviewOverdue).length;
    const owners = new Map();
    for (const policy of list) if (policy.owner) owners.set(policy.owner.name, (owners.get(policy.owner.name) ?? 0) + 1);
    const lastApproved = list.map((policy) => policy.approvedAt).filter(Boolean).sort().at(-1) ?? null;
    return { area, policies: list.length, score: rate, status: rate >= 90 && !reviewsDue ? "Compliant" : "Needs review", reviewsDue, owner: [...owners.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null, lastApproved };
  });

  // Upcoming dates in the next 60 days, soonest first
  const now = Date.now();
  const horizon = now + 60 * DAY;
  const inWindow = (date) => date && Date.parse(`${date}T12:00:00`) >= now - DAY && Date.parse(`${date}T12:00:00`) <= horizon;
  const deadlines = [
    ...live.filter((policy) => inWindow(policy.nextReviewDate)).map((policy) => ({ title: `Annual review: ${policy.name}`, area: "Policy Documents", date: policy.nextReviewDate, href: `${BASE}/policy-documents/${policy.id}` })),
    ...training.upcoming.map((item) => ({ title: `${item.title} due (${item.employees} employee${item.employees === 1 ? "" : "s"})`, area: "Training Logs", date: item.dueDate, href: `${BASE}/training-logs` })),
    ...evidence.results.filter((item) => item.status === "Verified" && inWindow(item.expiresOn)).map((item) => ({ title: `${item.name} expires`, area: "Evidence Repository", date: item.expiresOn, href: `${BASE}/evidence-repository` })),
    ...soc2.milestones.filter((item) => !item.done && inWindow(item.startsOn)).map((item) => ({ title: `SOC 2: ${item.title}`, area: "SOC 2 Readiness", date: item.startsOn, href: `${BASE}/soc2-readiness` })),
    ...soc2.controls.filter((control) => !control.ready && inWindow(control.dueDate)).map((control) => ({ title: `Control ${control.id} due`, area: "SOC 2 Readiness", date: control.dueDate, href: `${BASE}/soc2-readiness` })),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);

  const attention = [
    { title: "Overdue policy acknowledgments", subtitle: "Employees past the deadline", count: policies.stats.overdueEmployees, tone: "red", href: `${BASE}/policy-documents` },
    { title: "Policies under review", subtitle: "Waiting for a Super Admin", count: policies.stats.underReview, tone: "amber", href: `${BASE}/policy-documents` },
    { title: "Overdue training", subtitle: "Assignments past their due date", count: training.stats.overdue, tone: "red", href: `${BASE}/training-logs` },
    { title: "Active incidents", subtitle: "Open or investigating", count: incidents.stats.active, tone: "amber", href: `${BASE}/incident-management` },
    { title: "Evidence needing attention", subtitle: "Expired, expiring in 30 days or sent back", count: evidence.stats.needsAttention, tone: "amber", href: `${BASE}/evidence-repository` },
    { title: "SOC 2 gaps", subtitle: "Controls not ready yet", count: soc2.kpis.openGaps, tone: "amber", href: `${BASE}/soc2-readiness` },
  ];

  return {
    kpis: {
      score,
      policiesApproved: policies.stats.approved,
      policiesTotal: policies.stats.total,
      ackRate,
      trainingRate,
      activeIncidents: incidents.stats.active,
      criticalHigh: incidents.stats.criticalHigh,
      readiness: soc2.kpis.readiness,
      openGaps: soc2.kpis.openGaps,
    },
    areas,
    deadlines,
    attention,
    permissions: { manage: user.role !== ROLES.AUDITOR },
  };
}
