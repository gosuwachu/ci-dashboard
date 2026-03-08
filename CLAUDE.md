# CI Dashboard

Next.js CI monitoring dashboard for mobile apps. Uses GitHub API and Jenkins API.

## Tech Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- SWR for client-side data fetching with 30s polling

## Commands
```bash
npm run dev                           # Start dev server (localhost:3000)
npm run build                         # Production build (no need to rm .next first)
```

## Environment Variables (.env.local)
- `GH_TOKEN` — GitHub personal access token
- `JENKINS_URL` — Jenkins base URL (default: http://localhost:8080)
- `JENKINS_USER` / `JENKINS_PASS` — Jenkins credentials (default: admin/admin)

## Structure
- `src/app/main/` — Main branch view (latest commit + previous)
- `src/app/pulls/` — PR list and PR detail views
- `src/app/api/github/` — Server-side GitHub API proxy routes
- `src/app/api/jenkins/` — Server-side Jenkins API proxy routes
- `src/components/` — Shared React components
- `src/lib/` — API clients, types, constants, utilities

## Key Patterns
- All API credentials stay server-side (Next.js API routes proxy to GitHub/Jenkins)
- Commit status contexts follow `ci/<platform>-<step>` naming (parsed via regex)
- Jenkins trigger uses `buildWithParameters` with CSRF crumb + session cookie forwarding
- Individual check re-run: fetches original build params from Jenkins API and replays them
- Shared link components (`AuthorLink`, `CommitLink`) used across main and pulls pages for consistent styling
- Checks page (`/checks`) takes clean URL params: `sha`, `job`, `build`, `name`, `pr` (optional). Jenkins build URL is reconstructed server-side from `job`+`build` via `toBuildUrl()` in `lib/jenkins.ts`
- The ci-cli sets `target_url` on GitHub commit statuses to point to the dashboard checks page with these params (via `dashboard_check_url` in `github.py`)
