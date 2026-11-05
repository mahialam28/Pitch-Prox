// Download one lead/prospect as a CSV file (runs in the browser).
export const exportLeadCsv = (lead) => {
  const fields = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone Number", lead.phoneNumber],
    ["Company / Address", lead.companyName ?? lead.propertyAddress],
    ["Lead Type", lead.leadType],
    ["Stage", lead.stage],
    ["Status", lead.status],
    ["Outcome", lead.outcome],
  ];
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = `${fields.map(([label]) => escape(label)).join(",")}\n${fields.map(([, value]) => escape(value)).join(",")}\n`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: `${(lead.name || "lead").replace(/[^\w-]+/g, "-")}.csv` });
  link.click();
  URL.revokeObjectURL(url);
};
