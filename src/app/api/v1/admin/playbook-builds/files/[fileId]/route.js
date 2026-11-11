import { withApi } from "@/lib/api";
import { builderFile, requireBuilder } from "@/lib/playbook-builder";

export const runtime = "nodejs";

// A builder file (images, audio and video open in the browser)
export const GET = withApi(async (_request, { params }) => {
  await requireBuilder();
  const { fileId } = await params;
  const file = await builderFile(fileId);
  const inline = /^(image\/(png|jpeg|webp)|audio\/|video\/|application\/pdf)/.test(file.mime);
  return new Response(file.bytes, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=3600",
    },
  });
});
