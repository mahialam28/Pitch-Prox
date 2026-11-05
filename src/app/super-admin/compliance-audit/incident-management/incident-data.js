export const initialIncidents = [
  {
    id: "INC-2024-0038",
    relatedTicket: "TKT-2849",
    title: "Suspicious Login Attempt",
    subtitle: "(Brute Force)",
    category: "Security Incident",
    categoryType: "security",
    severity: "High",
    status: "Investigating",
    reportedBy: {
      name: "Daniel Miller",
      role: "Security Administrator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    },
    assignedTo: {
      name: "Daniel Miller",
      role: "Security Administrator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    },
    reportedAt: "May 19, 2024",
    reportedTime: "10:24 AM",
    description:
      "Multiple failed authentication attempts detected from unrecognized IP ranges attempting credential stuffing against super-admin endpoints.",
    investigationFindings:
      "Multiple failed sign-in attempts were detected from an unrecognized IP address. The account was not compromised.",
    actionsTaken:
      "Blocked the source IP, reset the account password, and enabled MFA.",
    finalConclusion:
      "Attempt contained. No unauthorized access or data loss was found.",
    investigatedBy: {
      name: "Daniel Miller",
      role: "Security Administrator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    },
    investigationDate: "2024-05-20",
    proofFiles: [
      {
        id: "f-1",
        name: "login-attempts.png",
        size: "1.24 MB",
        type: "image",
      },
      {
        id: "f-2",
        name: "security-log.pdf",
        size: "856 KB",
        type: "pdf",
      },
    ],
    evidenceNote: "Login history and firewall logs attached.",
  },
  {
    id: "INC-2024-0037",
    title: "Unauthorized Access",
    subtitle: "(admin Impersonation)",
    category: "Unauthorized Access",
    categoryType: "unauthorized",
    severity: "Critical",
    status: "Investigating",
    reportedBy: {
      name: "Daniel Miller",
      role: "Security Administrator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    },
    assignedTo: {
      name: "Daniel Miller",
      role: "Security Administrator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    },
    reportedAt: "May 18, 2024",
    reportedTime: "04:15 PM",
    description:
      "Session token re-use detected from unexpected geo-location attempting privileged user escalation without secondary MFA challenge verification.",
    investigationFindings:
      "Session replay token intercepted from foreign CIDR block trying to invoke privileged user escalation endpoints.",
    actionsTaken:
      "Invalidated all active JWT tokens for user session, rotated signing secrets, and enforced FIDO2 hardware tokens.",
    finalConclusion:
      "Token revoked within 90 seconds of detection. No unauthorized data egress was identified.",
    investigatedBy: {
      name: "Daniel Miller",
      role: "Security Administrator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    },
    investigationDate: "2024-05-19",
    proofFiles: [
      {
        id: "f-3",
        name: "session-token-trace.json",
        size: "412 KB",
        type: "log",
      },
      {
        id: "f-4",
        name: "auth-audit-report.pdf",
        size: "1.08 MB",
        type: "pdf",
      },
    ],
    evidenceNote: "JWT revocation receipts and Cloudflare WAF dump attached.",
  },
  {
    id: "INC-2024-0036",
    relatedTicket: "TKT-2812",
    title: "Failed Payment Abuse",
    subtitle: "",
    category: "Payment / Billing Abuse",
    categoryType: "payment",
    severity: "Medium",
    status: "Closed",
    reportedBy: {
      name: "Daniel Miller",
      role: "Security Administrator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    },
    assignedTo: {
      name: "Daniel Miller",
      role: "Security Administrator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    },
    reportedAt: "May 18, 2024",
    reportedTime: "11:02 AM",
    description:
      "Automated card velocity testing detected on the subscription checkout flow originating from a proxy network.",
    investigationFindings:
      "Scripted bot network tested 142 stolen credit cards against checkout Stripe endpoint in under 3 minutes.",
    actionsTaken:
      "Enforced Cloudflare Turnstile CAPTCHA on payment checkout and blacklisted malicious Autonomous System Numbers (ASNs).",
    finalConclusion:
      "All unauthorized card attempts blocked. 0 chargebacks or fraudulent authorizations settled.",
    investigatedBy: {
      name: "Daniel Miller",
      role: "Security Administrator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    },
    investigationDate: "2024-05-18",
    proofFiles: [
      {
        id: "f-5",
        name: "stripe-velocity-alerts.pdf",
        size: "620 KB",
        type: "pdf",
      },
    ],
    evidenceNote: "Stripe Radar rule log and bot score distribution export.",
  },
  {
    id: "INC-2024-0035",
    title: "DDoS Mitigation Triggered",
    subtitle: "(Edge API Gateway)",
    category: "Security Incident",
    categoryType: "security",
    severity: "High",
    status: "Resolved",
    reportedBy: {
      name: "Sarah Johnson",
      role: "Security Lead",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140",
    },
    assignedTo: {
      name: "Sarah Johnson",
      role: "Security Lead",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140",
    },
    reportedAt: "May 17, 2024",
    reportedTime: "02:40 PM",
    description:
      "High volume HTTP flood targeted public webhook ingestion endpoint, causing temporary latency elevation.",
    investigationFindings:
      "Sudden surge of 85,000 req/sec aimed at legacy webhook intake URL.",
    actionsTaken:
      "Activated Cloudflare rate limits and rerouted webhook endpoints through isolated queue workers.",
    finalConclusion:
      "Traffic absorbed with zero service degradation or dropped customer events.",
    investigatedBy: {
      name: "Sarah Johnson",
      role: "Security Lead",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140",
    },
    investigationDate: "2024-05-17",
    proofFiles: [
      {
        id: "f-6",
        name: "gateway-traffic-metrics.png",
        size: "2.10 MB",
        type: "image",
      },
    ],
    evidenceNote: "Grafana latency telemetry and edge bandwidth logs.",
  },
  {
    id: "INC-2024-0034",
    title: "Privilege Escalation Warning",
    subtitle: "(Role Change Audit)",
    category: "Unauthorized Access",
    categoryType: "unauthorized",
    severity: "Critical",
    status: "Closed",
    reportedBy: {
      name: "Alex Rodriguez",
      role: "Compliance Officer",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=140",
    },
    assignedTo: {
      name: "Alex Rodriguez",
      role: "Compliance Officer",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=140",
    },
    reportedAt: "May 15, 2024",
    reportedTime: "09:12 AM",
    description:
      "Temporary IAM role elevated without matching Jira ticket reference in the automated changelog.",
    investigationFindings:
      "Emergency database maintenance triggered off-hours role assumption before ticket sync finished.",
    actionsTaken:
      "Linked Jira INC-4921 retroactively and confirmed authorization with VP of Infrastructure.",
    finalConclusion:
      "Legitimate operation verified. SOC2 audit trail updated accordingly.",
    investigatedBy: {
      name: "Alex Rodriguez",
      role: "Compliance Officer",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=140",
    },
    investigationDate: "2024-05-15",
    proofFiles: [
      {
        id: "f-7",
        name: "iam-role-audit-diff.txt",
        size: "94 KB",
        type: "log",
      },
    ],
    evidenceNote: "AWS CloudTrail assumed role events and engineer sign-off.",
  },
];

export const getIncidentById = (id) => {
  const normalizedId = (id || "").toUpperCase().trim();
  const found = initialIncidents.find(
    (item) => item.id.toUpperCase() === normalizedId
  );
  if (found) return found;

  // Fallback for dynamic ID
  return {
    id: id || "INC-2024-0038",
    title: "Suspicious Login Attempt",
    subtitle: "(Brute Force)",
    category: "Security Incident",
    categoryType: "security",
    severity: "High",
    status: "Investigating",
    reportedBy: {
      name: "Daniel Miller",
      role: "Security Administrator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    },
    assignedTo: {
      name: "Daniel Miller",
      role: "Security Administrator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    },
    reportedAt: "May 19, 2024",
    reportedTime: "10:24 AM",
    description:
      "Multiple failed authentication attempts detected from unrecognized IP ranges attempting credential stuffing against super-admin endpoints.",
    investigationFindings:
      "Multiple failed sign-in attempts were detected from an unrecognized IP address. The account was not compromised.",
    actionsTaken:
      "Blocked the source IP, reset the account password, and enabled MFA.",
    finalConclusion:
      "Attempt contained. No unauthorized access or data loss was found.",
    investigatedBy: {
      name: "Daniel Miller",
      role: "Security Administrator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    },
    investigationDate: "2024-05-20",
    proofFiles: [
      {
        id: "f-1",
        name: "login-attempts.png",
        size: "1.24 MB",
        type: "image",
      },
      {
        id: "f-2",
        name: "security-log.pdf",
        size: "856 KB",
        type: "pdf",
      },
    ],
    evidenceNote: "Login history and firewall logs attached.",
  };
};

export const severityFilterOptions = [
  "All Severity",
  "Critical",
  "High",
  "Medium",
  "Low",
];

// One category list for reporting, the table and the filters
export const INCIDENT_CATEGORIES = [
  "Security Incident",
  "Unauthorized Access",
  "Data Privacy / Exposure",
  "Payment / Billing Abuse",
  "Compliance / Policy Violation",
  "System / Service Outage",
  "Other",
];
export const INCIDENT_STATUSES = ["Open", "Investigating", "Resolved", "Closed"];

export const categoryFilterOptions = ["All Categories", ...INCIDENT_CATEGORIES];

export const statusFilterOptions = ["All Statuses", ...INCIDENT_STATUSES];

export const ownerFilterOptions = [
  "All Owners",
  "Daniel Miller",
  "Sarah Johnson",
  "Alex Rodriguez",
];
