# CI Dashboard

A real-time CI monitoring dashboard for mobile apps, built with Next.js. Displays commit statuses from GitHub and integrates with Jenkins to restart or re-run individual CI checks.

Part of the [Jenkins CI/CD Test Environment](https://github.com/gosuwachu/jenkins-setup) for mobile apps.

## Features

- **Main branch view** — latest commit with a colored status grid (green/red/yellow) grouped by platform (iOS/Android), plus expandable previous commits
- **Pull requests view** — open PRs with status badges, labels (GitHub-style colored pills), author links, and commit links
- **PR detail view** — full commit history with status grids, review state badge, branch info, and GitHub labels
- **Re-run checks** — re-run individual CI checks by replaying the original Jenkins build parameters, or restart all checks for a commit
- **Live polling** — auto-refreshes every 30 seconds via SWR
- **Direct links** — clickable commit SHAs, authors, PR numbers, and status cells link to GitHub and Jenkins console logs

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router) + TypeScript + [Tailwind CSS v4](https://tailwindcss.com/)
- [SWR](https://swr.vercel.app/) for client-side data fetching with polling

## Quick Start

```bash
npm install
cp .env.local.example .env.local  # or create manually (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file:

```env
GH_TOKEN=ghp_your_github_personal_access_token
JENKINS_URL=http://localhost:8080
JENKINS_USER=admin
JENKINS_PASS=admin
```

| Variable | Description | Default |
|----------|-------------|---------|
| `GH_TOKEN` | GitHub personal access token (repo scope) | required |
| `JENKINS_URL` | Jenkins base URL | `http://localhost:8080` |
| `JENKINS_USER` | Jenkins username | `admin` |
| `JENKINS_PASS` | Jenkins password | `admin` |

## Commands

```bash
npm run dev     # Start dev server with Turbopack (localhost:3000)
npm run build   # Production build
npm run start   # Start production server
```

## Project Structure

```
src/
├── app/
│   ├── main/page.tsx                        # Main branch view
│   ├── pulls/page.tsx                       # PR list view
│   ├── pulls/[number]/page.tsx              # PR detail view
│   ├── api/github/commits/route.ts          # GitHub commits proxy
│   ├── api/github/commits/[sha]/statuses/   # Commit statuses proxy
│   ├── api/github/pulls/route.ts            # PR list proxy
│   ├── api/github/pulls/[number]/route.ts   # PR detail proxy
│   └── api/jenkins/trigger/route.ts         # Jenkins build trigger
├── components/
│   ├── CommitList.tsx          # Main branch commit list with status grids
│   ├── CommitStatusGrid.tsx    # Colored status grid grouped by platform
│   ├── PullRequestList.tsx     # PR list with labels, links, status badges
│   ├── RestartButton.tsx       # Restart all checks for a commit
│   ├── LabelBadge.tsx          # GitHub-style colored label pill
│   ├── StatusBadge.tsx         # Status state pill (success/failure/pending)
│   ├── AuthorLink.tsx          # Link to GitHub profile
│   ├── CommitLink.tsx          # Link to GitHub commit
│   ├── NavTabs.tsx             # Main Branch / Pull Requests tabs
│   └── AppSelector.tsx         # App selector dropdown
└── lib/
    ├── github.ts               # GitHub API client
    ├── jenkins.ts              # Jenkins API client (trigger, params, crumb)
    ├── types.ts                # TypeScript interfaces
    ├── constants.ts            # Owner, repo, platforms, steps, polling interval
    └── utils.ts                # Shared utilities (timeAgo)
```

## Architecture

All API credentials stay server-side — Next.js API routes act as proxies to GitHub and Jenkins. The browser never sees tokens.

```
Browser (SWR polling)
  → Next.js API routes (server-side)
    → GitHub API (commit statuses, PRs, reviews)
    → Jenkins API (trigger builds, fetch build params)
```

### Commit Status Mapping

CI checks follow the naming convention `ci/<platform>-<step>` (e.g., `ci/ios-build`, `ci/android-unit-tests`). The dashboard parses these with a regex to group statuses by platform.

### Re-running Checks

Each status cell's `target_url` points to the Jenkins build that produced it. To re-run a check:

1. Fetch the original build's parameters from Jenkins API
2. Trigger `mobile-app-support/omnibus/buildWithParameters` with the same parameters

This replays the exact same CI step without restarting the entire pipeline.
