import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { ApiError, readJson, withApi } from "@/lib/api";
import { deleteTrainingAsset, readTrainingAsset, renameTrainingAsset, setTrainingAssetStatus } from "@/lib/ai-training";
import { readUpload } from "@/lib/storage";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// Download the stored file
export const GET = withApi(async (_request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP); const { assetId } = await params;
  const file = await readTrainingAsset(user, assetId);
  return new Response(await readUpload(file.storagePath), {
    headers: {
      "Content-Type": file.mime || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
});

// Body: { status: "active" | "paused" } and/or { name }
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP); const { assetId } = await params;
  const body = await readJson(request);
  if (body.status === undefined && body.name === undefined) throw new ApiError("Nothing to update.");
  if (body.status !== undefined) await setTrainingAssetStatus(user, assetId, body.status);
  const name = body.name !== undefined ? await renameTrainingAsset(user, assetId, body.name) : undefined;
  return NextResponse.json({ success: true, ...(name ? { name } : {}) });
});

export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP); const { assetId } = await params;
  await deleteTrainingAsset(user, assetId);
  return NextResponse.json({ success: true });
});
