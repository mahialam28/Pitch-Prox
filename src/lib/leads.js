import { ApiError } from "@/lib/api";
import { internalLeadTypeOptions, internalOutcomeOptions, leadStageOptions, leadStatusOptions, userLeadTypeOptions, userOutcomeOptions } from "@/utils.js/lead-options";

const emailPattern = /^\S+@\S+\.\S+$/;
const allowed = (options) => new Set(options.map((option) => option.value));
const stages = allowed(leadStageOptions);
const statuses = allowed(leadStatusOptions);
// Customers sell real estate; PitchProX reps sell to agents/teams, so their lists differ
const leadTypes = { customer: allowed(userLeadTypeOptions), internal: allowed(internalLeadTypeOptions) };
const outcomes = { customer: allowed(userOutcomeOptions), internal: allowed(internalOutcomeOptions) };

// Trimmed string or null; undefined stays undefined so PATCH can skip it
function text(value, label, maxLength) {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") throw new ApiError(`${label} must be text.`);
  const trimmed = value.trim();
  if (trimmed.length > maxLength) throw new ApiError(`${label} must be ${maxLength} characters or fewer.`);
  return trimmed || null;
}

function choice(value, label, options) {
  const result = text(value, label, 120);
  if (result && !options.has(result)) throw new ApiError(`${label} "${result}" is not a valid option.`);
  return result;
}

export function validateStage(value) {
  const stage = choice(value, "Stage", stages);
  if (!stage) throw new ApiError("Stage is required.");
  return stage;
}

// Validate the editable lead/prospect fields shared by the Leads and CRM forms.
// Returns DB column → value; with `partial` only supplied fields are returned.
// `internal` = a PitchProX sales pipeline (internal lead types and outcomes).
export function parseLeadFields(body, { partial = false, internal = false } = {}) {
  const kind = internal ? "internal" : "customer";
  const phone = body.phoneNumber ?? (Array.isArray(body.phoneNumbers) ? body.phoneNumbers.find((number) => typeof number === "string" && number.trim()) ?? null : undefined);
  const fields = {
    name: text(body.name ?? body.fullName, "Name", 255),
    email: text(body.email, "Email", 255),
    phone_number: text(phone, "Phone number", 64),
    property_address: text(body.propertyAddress, "Property address", 500),
    city: text(body.city, "City", 120),
    state: text(body.state, "State", 64),
    zip_code: text(body.zipCode, "Zip code", 32),
    lead_type: choice(body.leadType, "Lead type", leadTypes[kind]),
    stage: choice(body.stage ?? body.leadStage, "Stage", stages),
    status: choice(body.status, "Status", statuses),
    outcome: choice(body.outcome, "Outcome", outcomes[kind]),
    notes: text(body.notes, "Notes", 5000),
  };
  if (fields.email && !emailPattern.test(fields.email)) throw new ApiError("Email address is not valid.");
  if (partial) {
    if (fields.name === null) throw new ApiError("Name cannot be empty.");
    if (fields.stage === null) throw new ApiError("Stage cannot be empty.");
    if (fields.status === null) throw new ApiError("Status cannot be empty.");
    return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
  }
  if (!fields.name) throw new ApiError("Name is required.");
  const created = Object.fromEntries(Object.entries(fields).map(([column, value]) => [column, value ?? null]));
  return { ...created, stage: fields.stage || "New", status: fields.status || "Unknown" };
}

// Build "col = ?, col = ?" plus values for an UPDATE from parsed fields
export function updateClause(fields) {
  const entries = Object.entries(fields);
  if (!entries.length) throw new ApiError("No updates supplied.");
  return { sql: entries.map(([column]) => `${column} = ?`).join(", "), values: entries.map(([, value]) => value ?? null) };
}

export const leadColumns = "id, assigned_to AS assignedTo, name, email, phone_number AS phoneNumber, property_address AS propertyAddress, city, state, zip_code AS zipCode, lead_type AS leadType, stage, status, outcome, notes, follow_up_at AS followUpAt, created_at AS createdAt, updated_at AS updatedAt";
export const prospectColumns = "id, assigned_to AS assignedTo, lead_id AS leadId, name, email, phone_number AS phoneNumber, property_address AS propertyAddress, city, state, zip_code AS zipCode, lead_type AS leadType, stage, status, outcome, notes, follow_up_at AS followUpAt, created_at AS createdAt, updated_at AS updatedAt";
