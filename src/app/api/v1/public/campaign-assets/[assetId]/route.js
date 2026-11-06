import { withApi } from "@/lib/api";
import { readUpload } from "@/lib/storage";
import { loadAsset } from "@/lib/campaigns/templates";

export const runtime = "nodejs";

// Public on purpose: design images must load inside customers' email apps
export const GET = withApi(async (_request, { params }) => {
  const asset = await loadAsset((await params).assetId);
  const bytes = await readUpload(asset.storagePath);
  return new Response(bytes, { headers: { "Content-Type": asset.mime, "Cache-Control": "public, max-age=31536000, immutable" } });
});
