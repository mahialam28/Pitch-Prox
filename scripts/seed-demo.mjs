// Sample business data for client previews (run after the staff seed):
//
//   npm run db:seed:demo        # = db:seed (staff) + this script
//
// Adds a customer company with leads, CRM, tickets and mail; customer accounts,
// leads and calendar events for the sales reps. Safe to run more than once: it
// stops if the demo customer already exists. Every demo password is "password-123".
try { process.loadEnvFile(".env.local"); } catch { /* fall back to the shell environment */ }
if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed demo data with NODE_ENV=production.");
  process.exit(1);
}

const { createId, hashPassword, query, default: database } = await import("../src/lib/db.js");

const PASSWORD = "password-123";
const INTERNAL = "org_pitchprox_internal";
const CUSTOMER_ORG = "org_demo_sunrise";
const DEMO_CUSTOMER_EMAIL = "olivia.bennett@sunriserealty.demo";

// "N days from now at HH:MM" as a MySQL DATETIME in local time
const at = (days, time = "10:00") => {
  const date = new Date(Date.now() + days * 86400000);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${time}:00`;
};

async function userId(email) {
  const [row] = await query("SELECT id FROM users WHERE email = ?", [email]);
  if (!row) throw new Error(`${email} not found — run "npm run db:seed" first.`);
  return row.id;
}

async function addUser({ organizationId, name, email, role, activated = true, daysAgo = 60 }) {
  const id = createId("user");
  const { hash, salt } = hashPassword(PASSWORD);
  await query("INSERT INTO users (id, organization_id, name, email, password_hash, password_salt, role, password_set, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))", [
    id, organizationId, name, email, hash, salt, role, activated ? 1 : 0, daysAgo,
  ]);
  return id;
}

// A customer company: owner, subscription, account record (owned by a rep) and a recent sign-in
async function addCompany({ id, company, owner, email, plan, status, repId, seats, daysAgo, activated = true, phone, country = "United States" }) {
  await query("INSERT INTO organizations (id, name, created_at) VALUES (?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))", [id, company, daysAgo]);
  const ownerId = await addUser({ organizationId: id, name: owner, email, role: "customer_admin", activated, daysAgo });
  await query("INSERT INTO subscriptions (organization_id, plan_id, status, billing_cycle, current_period_start) VALUES (?, ?, ?, 'monthly', DATE_SUB(NOW(), INTERVAL ? DAY))", [id, plan, status, daysAgo % 30]);
  await query("INSERT INTO customer_accounts (organization_id, account_rep_id, contact_phone, country, seats, source, created_by, created_at) VALUES (?, ?, ?, ?, ?, 'sales', ?, DATE_SUB(NOW(), INTERVAL ? DAY))", [
    id, repId, phone, country, seats, repId, daysAgo,
  ]);
  if (activated) await query("INSERT INTO login_events (id, user_id, email, success, created_at) VALUES (?, ?, ?, 1, DATE_SUB(NOW(), INTERVAL ? HOUR))", [createId("login"), ownerId, email, (daysAgo % 5) * 20 + 2]);
  await query("INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, organization_id, action, entity_type, entity_id, summary, created_at) SELECT ?, users.id, users.name, users.role, ?, 'customer.created', 'organization', ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY) FROM users WHERE users.id = ?", [
    createId("audit"), id, id, `Created ${company} (${email}) on ${plan}, ${seats} seats`, daysAgo, repId,
  ]);
  return ownerId;
}

async function addLead(organizationId, assignedTo, lead, daysAgo) {
  await query(
    "INSERT INTO leads (id, organization_id, assigned_to, name, email, phone_number, property_address, city, state, zip_code, lead_type, stage, status, outcome, notes, follow_up_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))",
    [createId("lead"), organizationId, assignedTo, lead.name, lead.email, lead.phone, lead.address, lead.city ?? null, lead.state ?? null, lead.zip ?? null, lead.type, lead.stage, lead.status, lead.outcome ?? null, lead.notes ?? null, lead.followUp ?? null, daysAgo]
  );
}

async function addProspect(organizationId, assignedTo, prospect, daysAgo) {
  await query(
    "INSERT INTO prospects (id, organization_id, assigned_to, name, email, phone_number, property_address, lead_type, stage, status, outcome, notes, follow_up_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))",
    [createId("prospect"), organizationId, assignedTo, prospect.name, prospect.email, prospect.phone, prospect.address, prospect.type, prospect.stage, prospect.status, prospect.outcome ?? null, prospect.notes ?? null, prospect.followUp ?? null, daysAgo]
  );
}

async function addTicket({ organizationId, createdBy, openedBy = null, category, priority, subject, status, assignedTo = null, hoursAgo, messages, notes = [] }) {
  const id = createId("ticket");
  const answered = messages.some((message) => message.role === "agent");
  await query(
    "INSERT INTO support_tickets (id, organization_id, created_by, opened_by, category, priority, subject, status, assigned_to, first_response_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, IF(?, DATE_SUB(NOW(), INTERVAL ? HOUR), NULL), DATE_SUB(NOW(), INTERVAL ? HOUR), DATE_SUB(NOW(), INTERVAL ? HOUR))",
    [id, organizationId, createdBy, openedBy, category, priority, subject, status, assignedTo, answered ? 1 : 0, Math.max(hoursAgo - 1, 0), hoursAgo, Math.max(hoursAgo - messages.length, 0)]
  );
  for (const [index, message] of messages.entries()) {
    await query("INSERT INTO support_messages (id, ticket_id, author_id, author_role, body, created_at) VALUES (?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? MINUTE))", [
      createId("msg"), id, message.author, message.role, message.body, hoursAgo * 60 - index * 45,
    ]);
  }
  for (const note of notes) await query("INSERT INTO support_internal_notes (id, ticket_id, author_id, body) VALUES (?, ?, ?, ?)", [createId("note"), id, note.author, note.body]);
}

const addMail = (organizationId, userIdValue, to, subject, body, daysAgo) =>
  query("INSERT INTO mail_messages (id, organization_id, user_id, to_email, subject, body, created_at) VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))", [createId("mail"), organizationId, userIdValue, to, subject, body, daysAgo]);

const addEvent = (ownerId, event) =>
  query("INSERT INTO calendar_events (id, owner_id, title, description, event_type, department, visibility, location_link, starts_at, ends_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
    createId("event"), ownerId, event.title, event.description, event.type, event.department, event.visibility, event.link ?? null, at(event.day, event.start), at(event.day, event.end),
  ]);

try {
  const [existing] = await query("SELECT id FROM organizations WHERE id = ?", [CUSTOMER_ORG]);
  if (existing) {
    console.log("Demo business data already present; nothing to add.");
  } else {
    const ryan = await userId("ryan.anderson@pitchprox.test");
    const david = await userId("david.martinez@pitchprox.test");
    const sarah = await userId("sarah.johnson@pitchprox.test");
    const mike = await userId("mike.davis@pitchprox.test");
    const emily = await userId("emily.brown@pitchprox.test");

    // ── The demo customer (Customer portal) ──
    const olivia = await addCompany({ id: CUSTOMER_ORG, company: "Sunrise Realty Group", owner: "Olivia Bennett", email: DEMO_CUSTOMER_EMAIL, plan: "pro", status: "active", repId: ryan, seats: 5, daysAgo: 42, phone: "(512) 555-0142" });
    const marcus = await addUser({ organizationId: CUSTOMER_ORG, name: "Marcus Lee", email: "marcus.lee@sunriserealty.demo", role: "customer_member", daysAgo: 30 });
    await query("INSERT INTO calibration_sessions (id, organization_id, user_id, rounds_completed, duration_seconds, completed_at) VALUES (?, ?, ?, 5, 742, DATE_SUB(NOW(), INTERVAL 38 DAY))", [createId("calib"), CUSTOMER_ORG, olivia]);

    const customerLeads = [
      { name: "Jennifer Walsh", email: "jwalsh@gmail.example", phone: "(512) 555-0187", address: "4120 Ridgeview Dr", city: "Austin", state: "TX", zip: "78731", type: "Expired Listings", stage: "Appointment Set", status: "Hot", outcome: "Appointment Set", notes: "Listing expired after 94 days. Open to relisting at a lower price.", followUp: at(1, "14:00") },
      { name: "Robert Chen", email: "rchen@outlook.example", phone: "(512) 555-0133", address: "88 Lakeshore Blvd", city: "Austin", state: "TX", zip: "78746", type: "FSBO", stage: "In Conversation", status: "Warm", outcome: "Follow-Up Required", notes: "Selling on his own for 3 weeks. Wants comps before deciding.", followUp: at(2, "11:00") },
      { name: "Maria Gonzalez", email: "maria.g@yahoo.example", phone: "(737) 555-0161", address: "2307 Pecan St", city: "Round Rock", state: "TX", zip: "78664", type: "Pre-Foreclosure", stage: "Contacted", status: "Warm", outcome: "Information Requested", followUp: at(3, "10:30") },
      { name: "David Thompson", email: "dthompson@gmail.example", phone: "(512) 555-0109", address: "915 Oak Hollow Ln", city: "Cedar Park", state: "TX", zip: "78613", type: "Absentee Owners", stage: "Attempted", status: "Cold", outcome: "Voicemail" },
      { name: "Patricia Moore", email: "pmoore@icloud.example", phone: "(512) 555-0175", address: "61 Willow Creek Ct", city: "Austin", state: "TX", zip: "78704", type: "Probate", stage: "Qualified", status: "Hot", outcome: "Appointment Set", notes: "Executor of her mother's estate; wants to list in spring." },
      { name: "James Wilson", email: "jwilson@gmail.example", phone: "(737) 555-0128", address: "3300 Sunset Ridge", city: "Georgetown", state: "TX", zip: "78628", type: "Just Sold", stage: "New", status: "Unknown" },
      { name: "Linda Martinez", email: "lmartinez@outlook.example", phone: "(512) 555-0194", address: "1408 Maple Ave", city: "Pflugerville", state: "TX", zip: "78660", type: "Circle Prospecting", stage: "Follow-Up", status: "Warm", outcome: "Follow-Up Required", followUp: at(-1, "15:00") },
      { name: "Michael Brown", email: "mbrown@yahoo.example", phone: "(512) 555-0151", address: "702 Hilltop Rd", city: "Austin", state: "TX", zip: "78745", type: "Expired Listings", stage: "Contacted", status: "Cold", outcome: "Not Interested" },
    ];
    for (const [index, lead] of customerLeads.entries()) await addLead(CUSTOMER_ORG, index % 3 === 2 ? marcus : olivia, lead, index * 3 + 1);
    const customerProspects = [
      { name: "Jennifer Walsh", email: "jwalsh@gmail.example", phone: "(512) 555-0187", address: "4120 Ridgeview Dr", type: "Expired Listings", stage: "Appointment Set", status: "Hot", outcome: "Appointment Set", followUp: at(1, "14:00") },
      { name: "Patricia Moore", email: "pmoore@icloud.example", phone: "(512) 555-0175", address: "61 Willow Creek Ct", type: "Probate", stage: "Qualified", status: "Hot", outcome: "Appointment Set", followUp: at(4, "09:30") },
      { name: "Robert Chen", email: "rchen@outlook.example", phone: "(512) 555-0133", address: "88 Lakeshore Blvd", type: "FSBO", stage: "In Conversation", status: "Warm", outcome: "Follow-Up Required", followUp: at(2, "11:00") },
      { name: "Susan Clark", email: "sclark@gmail.example", phone: "(737) 555-0117", address: "45 Bluebonnet Way", type: "Just Listed", stage: "Follow-Up", status: "Warm", outcome: "Information Requested", followUp: at(5, "16:00") },
      { name: "Kevin Harris", email: "kharris@outlook.example", phone: "(512) 555-0122", address: "1900 Barton Hills Dr", type: "Absentee Owners", stage: "Contacted", status: "Cold", outcome: "Voicemail" },
      { name: "Nancy Lewis", email: "nlewis@icloud.example", phone: "(512) 555-0168", address: "77 Riverbend Pl", type: "Pre-Expired Listings", stage: "New", status: "Unknown" },
    ];
    for (const [index, prospect] of customerProspects.entries()) await addProspect(CUSTOMER_ORG, olivia, prospect, index * 2 + 1);

    await addTicket({
      organizationId: CUSTOMER_ORG, createdBy: olivia, category: "technical", priority: "high", subject: "Calls drop after about 2 minutes", status: "Waiting", assignedTo: emily, hoursAgo: 20,
      messages: [
        { author: olivia, role: "customer", body: "Our agents' calls keep dropping around the 2-minute mark since yesterday. Can you take a look?" },
        { author: emily, role: "agent", body: "Thanks Olivia — we found a timeout on your account's audio settings and reset it. Could you try a call and let us know?" },
      ],
      notes: [{ author: emily, body: "Reset the media timeout from 120s to default. Watch for a reply." }],
    });
    await addTicket({
      organizationId: CUSTOMER_ORG, createdBy: olivia, category: "billing", priority: "medium", subject: "Add two more seats to our plan", status: "Open", hoursAgo: 3,
      messages: [{ author: olivia, role: "customer", body: "We're hiring two agents next week. How do we add seats, and how is it prorated?" }],
    });
    await addTicket({
      organizationId: CUSTOMER_ORG, createdBy: marcus, category: "feature", priority: "low", subject: "Export CRM to CSV with notes", status: "Resolved", assignedTo: emily, hoursAgo: 96,
      messages: [
        { author: marcus, role: "customer", body: "Is there a way to include notes when exporting the CRM?" },
        { author: emily, role: "agent", body: "Yes — the CRM export now includes the Notes column. Let us know if you need anything else!" },
      ],
    });
    await addMail(CUSTOMER_ORG, olivia, "jwalsh@gmail.example", "Your home at 4120 Ridgeview Dr", "Hi Jennifer,\n\nGreat speaking with you today. As promised, here are three recent sales near you.\n\nTalk soon,\nOlivia", 1);
    await addMail(CUSTOMER_ORG, olivia, "rchen@outlook.example", "Comparable sales for 88 Lakeshore Blvd", "Hi Robert,\n\nAttached is the market snapshot we discussed.\n\nBest,\nOlivia", 3);

    // ── More customer accounts owned by the reps (Customers list, dashboards) ──
    const harbor = await addCompany({ id: "org_demo_harbor", company: "Harbor Homes Realty", owner: "Daniel Price", email: "daniel.price@harborhomes.demo", plan: "basic", status: "active", repId: ryan, seats: 3, daysAgo: 25, phone: "(305) 555-0190" });
    await addCompany({ id: "org_demo_keystone", company: "Keystone Properties", owner: "Rachel Kim", email: "rachel.kim@keystone.demo", plan: "free-trial", status: "trialing", repId: ryan, seats: 2, daysAgo: 6, phone: "(602) 555-0148" });
    await addCompany({ id: "org_demo_mapleoak", company: "Maple & Oak Realty", owner: "Thomas Reed", email: "thomas.reed@mapleoak.demo", plan: "pro", status: "pending_payment", repId: ryan, seats: 8, daysAgo: 2, activated: false, phone: "(617) 555-0103" });
    await addCompany({ id: "org_demo_summit", company: "Summit Brokers Group", owner: "Angela Foster", email: "angela.foster@summitbrokers.demo", plan: "elite", status: "active", repId: david, seats: 12, daysAgo: 55, phone: "(303) 555-0176" });
    await addCompany({ id: "org_demo_coastal", company: "Coastal Living Partners", owner: "Brian Walker", email: "brian.walker@coastalliving.demo", plan: "basic", status: "canceled", repId: david, seats: 2, daysAgo: 80, phone: "(858) 555-0131" });

    // ── PitchProX's own pipeline (Sales Rep leads and CRM) ──
    const repLeads = [
      { name: "Amanda Ross", email: "amanda@rossteam.example", phone: "(214) 555-0182", address: "Ross Realty Team", type: "Small Teams", stage: "Qualified", status: "Hot", outcome: "Demo Scheduled", notes: "6-agent team, currently using a dialer with no coaching.", followUp: at(1, "15:30") },
      { name: "Greg Patterson", email: "greg@pattersonhomes.example", phone: "(469) 555-0114", address: "Patterson Homes", type: "Solo agent", stage: "In Conversation", status: "Warm", outcome: "Pricing Discussed", followUp: at(2, "10:00") },
      { name: "Stephanie Long", email: "slong@longbrokerage.example", phone: "(972) 555-0157", address: "Long & Partners Brokerage", type: "Mid-Size Teams", stage: "Appointment Set", status: "Hot", outcome: "Demo Requested", followUp: at(0, "16:00") },
      { name: "Victor Alvarez", email: "victor@alvarezgroup.example", phone: "(817) 555-0136", address: "Alvarez Group", type: "Micro-Teams", stage: "Contacted", status: "Warm", outcome: "Call Back", followUp: at(-2, "11:00") },
      { name: "Heather Collins", email: "heather@collinsre.example", phone: "(214) 555-0199", address: "Collins Real Estate", type: "Junior agent", stage: "Attempted", status: "Cold", outcome: "Voicemail" },
      { name: "Paul Nguyen", email: "paul@nguyenrealty.example", phone: "(469) 555-0145", address: "Nguyen Realty", type: "Large Teams / Brokerages", stage: "New", status: "Unknown" },
    ];
    for (const [index, lead] of repLeads.entries()) await addLead(INTERNAL, ryan, lead, index * 2);
    await addLead(INTERNAL, david, { name: "Olga Petrova", email: "olga@petrovahomes.example", phone: "(720) 555-0121", address: "Petrova Homes", type: "Top-10 local producer", stage: "Qualified", status: "Hot", outcome: "Trial Interested" }, 4);
    const repProspects = [
      { name: "Amanda Ross", email: "amanda@rossteam.example", phone: "(214) 555-0182", address: "Ross Realty Team", type: "Small Teams", stage: "Qualified", status: "Hot", outcome: "Demo Scheduled", followUp: at(1, "15:30") },
      { name: "Stephanie Long", email: "slong@longbrokerage.example", phone: "(972) 555-0157", address: "Long & Partners Brokerage", type: "Mid-Size Teams", stage: "Appointment Set", status: "Hot", outcome: "Proposal Sent", followUp: at(3, "13:00") },
      { name: "Greg Patterson", email: "greg@pattersonhomes.example", phone: "(469) 555-0114", address: "Patterson Homes", type: "Solo agent", stage: "In Conversation", status: "Warm", outcome: "Pricing Discussed" },
      { name: "Mark Jensen", email: "mark@jensenteam.example", phone: "(512) 555-0102", address: "Jensen Team", type: "Mega-Teams", stage: "Follow-Up", status: "Warm", outcome: "Decision Pending", followUp: at(6, "10:00") },
    ];
    for (const [index, prospect] of repProspects.entries()) await addProspect(INTERNAL, ryan, prospect, index * 3);

    // A ticket the rep opened for one of their customers, and the rep's own sent mail
    await addTicket({
      organizationId: "org_demo_harbor", createdBy: harbor, openedBy: ryan, category: "account", priority: "medium", subject: "Owner can't add a team member", status: "In progress", assignedTo: emily, hoursAgo: 28,
      messages: [{ author: ryan, role: "agent", body: "Daniel tried to invite a new agent and got an error. Can support check the seat count on Harbor Homes?" }],
    });
    await addMail(INTERNAL, ryan, "amanda@rossteam.example", "PitchProX demo — tomorrow 3:30 PM", "Hi Amanda,\n\nLooking forward to showing your team PitchProX tomorrow.\n\nBest,\nRyan", 0);
    await addMail(INTERNAL, ryan, "greg@pattersonhomes.example", "PitchProX pricing for solo agents", "Hi Greg,\n\nHere's the Basic vs Pro comparison we talked about.\n\nRyan", 2);

    // ── Internal calendar (relative to today) ──
    const events = [
      [mike, { title: "Daily Sales Standup", description: "Blockers, hot leads and today's demos.", type: "Sales", department: "Sales", visibility: "Internal Only", day: 0, start: "09:00", end: "09:30", link: "https://meet.google.com/pitchprox-standup" }],
      [ryan, { title: "Demo: Ross Realty Team", description: "Product demo for a 6-agent team.", type: "Sales", department: "Sales", visibility: "All Employees", day: 1, start: "15:30", end: "16:15" }],
      [sarah, { title: "Q4 Planning", description: "Targets, hiring and roadmap for next quarter.", type: "Company Meeting", department: "Management", visibility: "Management Only", day: 2, start: "11:00", end: "12:30" }],
      [emily, { title: "Support Coverage Review", description: "Weekend on-call rotation and SLA check.", type: "Support", department: "Support", visibility: "All Employees", day: 3, start: "14:00", end: "15:00" }],
      [mike, { title: "Objection Handling Workshop", description: "Role-play the top 5 objections from last month's calls.", type: "Training", department: "Sales", visibility: "All Employees", day: 4, start: "10:00", end: "11:30" }],
      [sarah, { title: "All-Hands Meeting", description: "Monthly company update.", type: "Company Meeting", department: "All Departments", visibility: "All Employees", day: 7, start: "16:00", end: "17:00", link: "https://meet.google.com/pitchprox-allhands" }],
      [ryan, { title: "Prep: Long & Partners proposal", description: "Finalize pricing before sending.", type: "Sales", department: "Sales", visibility: "Private", day: 2, start: "16:30", end: "17:00" }],
      [sarah, { title: "Security Policy Review", description: "Annual review of access and password policies.", type: "Compliance", department: "Management", visibility: "Internal Only", day: 9, start: "13:00", end: "14:00" }],
    ];
    for (const [owner, event] of events) await addEvent(owner, event);

    console.log(`Added demo business data. Customer sign-in: ${DEMO_CUSTOMER_EMAIL} / ${PASSWORD}`);
  }
} catch (error) {
  console.error(`Demo seeding failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await database.end();
}
