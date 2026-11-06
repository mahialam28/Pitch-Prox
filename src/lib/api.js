import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hashToken, query } from "@/lib/db";

// An error whose message is safe to show to the client
export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized() {
  return jsonError("You must sign in to access this resource.", 401);
}

export function forbidden() {
  return jsonError("You do not have permission to access this resource.", 403);
}

// Parse a JSON object body, rejecting malformed JSON and non-object payloads
export async function readJson(request) {
  let body;
  try { body = await request.json(); } catch { throw new ApiError("Invalid request body."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError("Invalid request body.");
  return body;
}

// Wrap a route handler so every failure maps to the right status code and
// unexpected errors are logged on the server without leaking details.
// Read-only impersonation: staff viewing a customer's portal can look but not change anything.
// Leaving the impersonation (and signing out) still works.
const READ_ONLY_ALLOWED = ["/api/v1/auth/sign-out", "/api/v1/auth/impersonation"];

async function assertWritable(request) {
  if (!request?.method || ["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  if (READ_ONLY_ALLOWED.includes(new URL(request.url).pathname)) return;
  const token = (await cookies()).get("pitchprox_session")?.value;
  if (!token) return;
  const [row] = await query(
    "SELECT impersonation_sessions.access FROM sessions JOIN impersonation_sessions ON impersonation_sessions.id = sessions.impersonation_id WHERE sessions.token_hash = ?",
    [hashToken(token)]
  );
  if (row?.access === "readonly") throw new ApiError("You are viewing this account in read-only mode.", 403);
}

export function withApi(handler) {
  return async (...args) => {
    try {
      await assertWritable(args[0]);
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) return jsonError(error.message, error.status);
      if (error?.message === "UNAUTHORIZED") return unauthorized();
      if (error?.message === "FORBIDDEN") return forbidden();
      console.error(error);
      return jsonError("Something went wrong.", 500);
    }
  };
}
