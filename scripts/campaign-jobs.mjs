// Campaigns & Journeys scheduler: calls POST /api/v1/jobs/run every few minutes.
// One pass sends due broadcasts, enrolls users into live journeys, moves them along their
// steps, sends transactional emails and hands queued emails to the email service.
//
//   npm run jobs                       # local (uses http://localhost:3000)
//   pm2 start ecosystem.config.cjs     # production: runs as the "pitchprox-jobs" app
//
// Needs CRON_SECRET (the same value the web app has) and APP_URL (where the app answers).
// Env: JOBS_INTERVAL_MINUTES (default 5).
import { readFileSync } from "node:fs";

// Read .env.local like Next.js does (only keys not already set)
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* no .env.local */
}

const url = `${(process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "")}/api/v1/jobs/run`;
const secret = process.env.CRON_SECRET;
const minutes = Math.max(1, Number(process.env.JOBS_INTERVAL_MINUTES || 5));
if (!secret) {
  console.error("CRON_SECRET is not set. Add it to .env.local (any long random string) and restart the web app too.");
  process.exit(1);
}

async function runOnce() {
  const started = new Date();
  try {
    const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${secret}` } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) console.error(`[${started.toISOString()}] run failed: ${response.status} ${body.error ?? ""}`);
    else console.log(`[${started.toISOString()}] ${body.skipped ?? `enrolled ${body.enrolled}, journey emails ${body.emails}, campaign emails ${body.broadcasts?.recipients}, transactional ${body.transactional}, waiting ${body.delivery?.waiting}`}`);
  } catch (error) {
    console.error(`[${started.toISOString()}] could not reach ${url}: ${error.message}`);
  }
}

await runOnce();
setInterval(runOnce, minutes * 60000);
