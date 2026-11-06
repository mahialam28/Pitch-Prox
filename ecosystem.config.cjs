// PM2 process file for the CloudPanel server.
//
//   pm2 start ecosystem.config.cjs     # first start
//   pm2 reload pitchprox               # after `git pull && npm ci && npm run build`
//   pm2 save                           # remember it across reboots
//
// PORT must match the "App Port" of the site in CloudPanel (its vhost proxies to it).
// Database settings stay in .env.local, which Next.js loads by itself.
const PORT = 8765;

module.exports = {
  apps: [
    {
      name: "pitchprox",
      cwd: __dirname,
      // Run Next.js directly (not through npm) so PM2 tracks the real process
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${PORT} -H 127.0.0.1`,
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT,
      },
      // Restart if it crashes or grows too large; give up after repeated instant crashes
      autorestart: true,
      max_memory_restart: "1G",
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 3000,
      // Logs: `pm2 logs pitchprox`
      time: true,
      merge_logs: true,
    },
    {
      // Campaigns & Journeys scheduler: calls /api/v1/jobs/run every 5 minutes.
      // Needs CRON_SECRET and APP_URL in .env.local (see DEPLOYMENT.md).
      name: "pitchprox-jobs",
      cwd: __dirname,
      script: "scripts/campaign-jobs.mjs",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        APP_URL: `http://127.0.0.1:${PORT}`,
      },
      autorestart: true,
      restart_delay: 10000,
      time: true,
    },
  ],
};
