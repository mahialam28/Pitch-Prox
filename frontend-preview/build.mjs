// Builds the design-only Frontend (../Frontend) from this app:
//   node frontend-preview/build.mjs
// Copies src/ without the API and database code, adds the preview overlay (in-browser
// sample-data API, any-email sign-in, role buttons), and writes a standalone package.json.
// Re-run after every design change in src/ so the preview stays in step.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const out = path.join(root, "Frontend");
const keep = new Set(["node_modules", ".next", ".vercel", "package-lock.json", "docs"]); // docs: client documents (e.g. the page list)

mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) if (!keep.has(entry)) rmSync(path.join(out, entry), { recursive: true, force: true });

// 1. The app source, minus server-only parts
const skip = [/^app\/api(\/|$)/, /^app\/demo(\/|$)/, /^lib\/schema(\/|$)/, /^lib\/catalogs(\/|$)/];
cpSync(path.join(root, "src"), path.join(out, "src"), {
  recursive: true,
  filter: (source) => {
    const relative = path.relative(path.join(root, "src"), source).split(path.sep).join("/");
    return !skip.some((pattern) => pattern.test(relative));
  },
});
// Server modules that talk to the database (nothing in the UI imports them)
const libDir = path.join(out, "src", "lib");
for (const file of readdirSync(libDir)) {
  const full = path.join(libDir, file);
  if (!statSync(full).isFile()) continue;
  const text = readFileSync(full, "utf8");
  if (/from "@\/lib\/db"|from "\.\/db(\.js)?"|mysql2|next\/headers/.test(text) || file === "db.js" || file === "demo.js") rmSync(full);
}
// API-route helpers, now unused
for (const file of ["api.js", "leads.js", "listing.js", "permissions.js", "pipeline.js", "storage.js"]) rmSync(path.join(libDir, file), { force: true });

// 2. Preview overlay (replaces lib/auth.js, sign-in and onboarding pages, page banners)
cpSync(path.join(here, "overlay"), out, { recursive: true });

// 3. Root layout: load the sample-data API first and show the preview bar
const layoutPath = path.join(out, "src", "app", "layout.js");
let layout = readFileSync(layoutPath, "utf8");
layout = layout
  .replace('import DevelopmentNotice from "@/components/shared/development-notice";', 'import DevelopmentNotice from "@/components/shared/development-notice";\nimport InstallMockApi from "@/preview/install-mock-api";\nimport PreviewBar from "@/preview/preview-bar";')
  .replace(/(<body[^>]*>)/, "$1\n        <InstallMockApi />")
  .replace("<DevelopmentNotice />", "<DevelopmentNotice />\n        <PreviewBar />")
  .replace(/title: "[^"]*",/, 'title: "PitchProX — Design Preview",');
if (!layout.includes("<InstallMockApi />") || !layout.includes("<PreviewBar />")) throw new Error("Could not patch src/app/layout.js; update frontend-preview/build.mjs");
writeFileSync(layoutPath, layout);

// 4. Project files
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
delete pkg.dependencies.mysql2;
pkg.name = "pitchprox-frontend-preview";
pkg.scripts = { dev: "next dev", build: "next build", start: "next start", lint: "eslint" };
writeFileSync(path.join(out, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);
for (const file of ["jsconfig.json", "postcss.config.mjs", "eslint.config.mjs", "AGENTS.md", "CLAUDE.md"]) {
  if (existsSync(path.join(root, file))) cpSync(path.join(root, file), path.join(out, file));
}
const nextConfig = readFileSync(path.join(root, "next.config.mjs"), "utf8").replace(
  "const nextConfig = {",
  "const nextConfig = {\n  // Standalone app: don't treat the parent folder (the full app) as the workspace root\n  turbopack: { root: import.meta.dirname },"
);
writeFileSync(path.join(out, "next.config.mjs"), nextConfig);
writeFileSync(path.join(out, ".gitignore"), "/node_modules\n/.next/\n/out/\n.vercel\n.env*\n.DS_Store\n");
writeFileSync(path.join(out, "README.md"), `# PitchProX — design preview

Front-end only build of PitchProX for client review. **Generated — don't edit here.**
Make design changes in the main app (\`../src\`) and run \`node frontend-preview/build.mjs\` from the main app folder.

- No server or database: every \`/api/\` call is answered in the browser from sample data (\`src/preview/\`).
- Sign in with **any email and password** (opens the User portal), or use the role buttons on the sign-in page.
- Changes made while previewing stay in that browser until "Switch role" / Logout.

Run locally: \`npm install && npm run dev\`. Deploy on Vercel: import the repo and set **Root Directory** to \`Frontend\`. No environment variables are needed.
`);
console.log(`Frontend preview written to ${out}`);
