// Phase 13: several phone numbers per lead/prospect, each with its own status (client, Nov 9).
// A bad number doesn't mark the whole contact; the other numbers stay callable.
import { test } from "node:test";
import assert from "node:assert/strict";
import { RUN, newCustomer } from "./helpers.mjs";

const customer = await newCustomer("phones");
const other = await newCustomer("phonesother");
const numbers = (contact) => contact.phones.map((phone) => [phone.number, phone.label, phone.status]);

test("a prospect keeps every number with its type; the first callable one is the main number", async () => {
  const created = await customer.post("/api/v1/crm/prospects", {
    name: `Four Numbers ${RUN}`,
    phones: [
      { number: "(555) 300-0001", label: "Mobile" },
      { number: "(555) 300-0002", label: "Home" },
      { number: "555.300.0003", label: "Work" },
      { number: "(555) 300-0001", label: "Home" },
    ],
  });
  assert.equal(created.status, 201, JSON.stringify(created.json));
  const prospect = created.json.prospect;
  assert.deepEqual(numbers(prospect), [["(555) 300-0001", "Mobile", "not_called"], ["(555) 300-0002", "Home", "not_called"], ["555.300.0003", "Work", "not_called"]], "duplicates dropped, order kept");
  assert.equal(prospect.phoneNumber, "(555) 300-0001");
  assert.equal(prospect.workingPhones, 3);

  // Bad number on the first: only that number; the main number moves to the next working one
  const [first, second, third] = prospect.phones;
  const marked = await customer.patch(`/api/v1/crm/prospects/${prospect.id}/phones/${first.id}`, { status: "bad", called: true });
  assert.equal(marked.status, 200, JSON.stringify(marked.json));
  assert.deepEqual(marked.json.phones.map((phone) => [phone.status, phone.callable]), [["bad", false], ["not_called", true], ["not_called", true]]);
  assert.ok(marked.json.phones[0].lastCalledAt, "the call is stamped");
  let detail = (await customer.get(`/api/v1/crm/prospects/${prospect.id}`)).json.prospect;
  assert.equal(detail.phoneNumber, "(555) 300-0002", "the main number is the first callable one");
  assert.equal(detail.workingPhones, 2);
  assert.equal(detail.outcome, null, "the prospect itself isn't marked");
  assert.equal((await customer.patch(`/api/v1/crm/prospects/${prospect.id}/phones/${first.id}`, { status: "nope" })).status, 400);

  // "Wrong Number" from the outcome dropdown is about one number
  const ambiguous = await customer.patch(`/api/v1/crm/prospects/${prospect.id}`, { outcome: "Wrong Number" });
  assert.equal(ambiguous.status, 409, "several numbers: which one?");
  assert.match(ambiguous.json.error, /Choose which number/);
  const wrong = await customer.patch(`/api/v1/crm/prospects/${prospect.id}`, { outcome: "Wrong Number", phoneId: second.id });
  assert.equal(wrong.status, 200, JSON.stringify(wrong.json));
  assert.equal(wrong.json.prospect.outcome, null, "a working number is left, so the prospect's outcome doesn't change");
  assert.equal(wrong.json.prospect.phones.find((phone) => phone.id === second.id).status, "wrong");
  assert.equal(wrong.json.prospect.phoneNumber, "555.300.0003");
  // The last working number too → now the prospect is a Wrong Number
  const last = await customer.patch(`/api/v1/crm/prospects/${prospect.id}`, { outcome: "Wrong Number", phoneId: third.id });
  assert.equal(last.json.prospect.outcome, "Wrong Number");
  assert.equal(last.json.prospect.workingPhones, 0);

  // Editing the list keeps a saved number's status; removed numbers go, new ones start fresh
  const edited = await customer.patch(`/api/v1/crm/prospects/${prospect.id}`, { phones: [{ number: "555-300-0002", label: "Home" }, { number: "(555) 300-0009", label: "Other" }] });
  assert.equal(edited.status, 200, JSON.stringify(edited.json));
  assert.deepEqual(numbers(edited.json.prospect), [["555-300-0002", "Home", "wrong"], ["(555) 300-0009", "Other", "not_called"]]);
  assert.equal(edited.json.prospect.phoneNumber, "(555) 300-0009");

  // Only your own company's
  assert.equal((await other.patch(`/api/v1/crm/prospects/${prospect.id}/phones/${second.id}`, { status: "good" })).status, 404);
  assert.equal((await customer.patch(`/api/v1/crm/prospects/${prospect.id}/phones/phone_missing`, { status: "good" })).status, 404);
});

test("leads take several numbers too; a prospect made from a lead brings them along", async () => {
  const lead = (await customer.post("/api/v1/leads", { name: `Lead Numbers ${RUN}`, phoneNumbers: ["(555) 400-0001", "", "(555) 400-0002"] })).json.lead;
  assert.deepEqual(lead.phones.map((phone) => phone.number), ["(555) 400-0001", "(555) 400-0002"], "the older form sends strings");
  await customer.patch(`/api/v1/leads/${lead.id}/phones/${lead.phones[0].id}`, { status: "disconnected" });

  // Search by any of the numbers, with or without formatting
  const found = (await customer.get(`/api/v1/leads?search=5554000002`)).json.results;
  assert.ok(found.some((item) => item.id === lead.id), "found by the second number");

  const prospect = (await customer.post("/api/v1/crm/prospects", { name: lead.name, leadId: lead.id })).json.prospect;
  assert.deepEqual(prospect.phones.map((phone) => [phone.number, phone.status]), [["(555) 400-0001", "disconnected"], ["(555) 400-0002", "not_called"]]);
  assert.equal(prospect.phoneNumber, "(555) 400-0002");

  // A single number (older screens) still works
  const single = (await customer.post("/api/v1/leads", { name: `One Number ${RUN}`, phoneNumber: "(555) 400-0100" })).json.lead;
  assert.equal(single.phones.length, 1);
  assert.equal(single.phones[0].label, "Mobile");
});

test("phone number validation", async () => {
  assert.equal((await customer.post("/api/v1/crm/prospects", { name: "Bad", phones: [{ number: "abc" }] })).status, 400);
  const tooMany = Array.from({ length: 7 }, (_, index) => ({ number: `(555) 500-000${index}` }));
  assert.equal((await customer.post("/api/v1/crm/prospects", { name: "Many", phones: tooMany })).status, 400);
  const prospect = (await customer.post("/api/v1/crm/prospects", { name: `Validate ${RUN}`, phones: [{ number: "(555) 600-0001", label: "Fax" }] })).json.prospect;
  assert.equal(prospect.phones[0].label, "Mobile", "unknown types fall back to Mobile");
  assert.equal((await customer.patch(`/api/v1/crm/prospects/${prospect.id}`, {})).status, 400, "nothing to update");
});
