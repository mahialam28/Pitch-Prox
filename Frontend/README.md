# PitchProX — design preview

Front-end only build of PitchProX for client review. **Generated — don't edit here.**
Make design changes in the main app (`../src`) and run `node frontend-preview/build.mjs` from the main app folder.

- No server or database: every `/api/` call is answered in the browser from sample data (`src/preview/`).
- Sign in with **any email and password** (opens the User portal), or use the role buttons on the sign-in page.
- Changes made while previewing stay in that browser until "Switch role" / Logout.

Run locally: `npm install && npm run dev`. Deploy on Vercel: import the repo and set **Root Directory** to `Frontend`. No environment variables are needed.
