import { NextResponse } from "next/server";
import { ApiError, readJson, withApi } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { confirmMfaSetup, disableMfa, regenerateRecoveryCodes, startMfaSetup } from "@/lib/mfa";

export const runtime = "nodejs";

// Two-step login for the signed-in person:
//   setup           → { secret, otpauthUrl, qrCode }       (nothing changes until confirmed)
//   confirm         { code } → status + recoveryCodes (shown once)
//   disable         { password, code }
//   recovery-codes  { code } → new recovery codes (the old ones stop working)
export const POST = withApi(async (request, { params }) => {
  const user = await requireCurrentUser();
  // Staff viewing a customer's portal can't change that customer's sign-in
  if (user.impersonation) throw new ApiError("Two-step login can only be changed by the account owner.", 403);
  const { action } = await params;
  const body = action === "setup" ? {} : await readJson(request);
  if (action === "setup") return NextResponse.json(await startMfaSetup(user));
  if (action === "confirm") return NextResponse.json(await confirmMfaSetup(user, body.code));
  if (action === "disable") return NextResponse.json(await disableMfa(user, body));
  if (action === "recovery-codes") return NextResponse.json(await regenerateRecoveryCodes(user, body.code));
  throw new ApiError("Not found.", 404);
});
