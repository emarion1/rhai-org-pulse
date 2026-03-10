# AI Engineering Team Tracker

Internal dashboard for tracking AI Platform engineering team productivity across Jira and GitHub.

## Quick Start (Demo Mode)

New contributors can get the app running in 3 commands without any Jira, GitHub, or Firebase credentials:

```bash
# 1. Install dependencies
npm install

# 2. Create .env with demo mode enabled
echo "DEMO_MODE=true" > .env
echo "VITE_DEMO_MODE=true" >> .env

# 3. Start dev servers
npm run dev:full
```

Open http://localhost:5173. You'll see the dashboard with sample fixture data.

## Quick Start (Full Setup)

For full functionality with real Jira and GitHub data:

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your Jira PAT and Firebase config

# 3. Start dev servers (frontend + backend)
npm run dev:full
```

Open http://localhost:5173. The backend runs on port 3001, proxied via Vite.

## Prerequisites

For full setup (demo mode has no prerequisites):

- Node.js 18+
- A Jira Personal Access Token (issues.redhat.com)
- Firebase project credentials (for Google OAuth)
- @redhat.com Google account (auth is restricted)

## Contributing

All contributors use [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Project conventions, architecture, and deployment details are documented in `.claude/CLAUDE.md` — Claude Code reads this automatically.

### Common workflows

```bash
# Run tests
npm test

# Start frontend only
npm run dev

# Start backend only (needs JIRA_TOKEN)
npm run dev:server

# Start both
npm run dev:full
```

### Deploying

| Target | Command |
|--------|---------|
| Frontend | `git push` (Amplify auto-deploys) |
| Lambda functions | `amplify push --yes --force` |
| Data files | `aws s3 sync data/ s3://acorvin-team-tracker-data-prod/` |

AWS commands require SAML auth: prefix with `rh-aws-saml-login iaps-rhods-odh-dev/585132637328-rhoai-dev --`

## Tech Stack

- **Frontend**: Vue 3, Vite 6, Tailwind CSS 3, Chart.js 4
- **Backend**: Express (local dev), AWS Lambda (production)
- **Auth**: Firebase Google OAuth
- **Storage**: Local filesystem (dev), S3 (prod)
- **Hosting**: AWS Amplify
- **Testing**: Vitest
