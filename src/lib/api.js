import { NextResponse } from "next/server";

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
export function withApi(handler) {
  return async (...args) => {
    try {
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
