# What needs Jessie's accounts

Nothing here can be done from outside. Each item is a login, a secret or a billing decision.

| # | What | Where | Why it is needed | Time |
|---|---|---|---|---|
| 1 | Test copy of the site repo | GitHub (`ozone503-maker`) | The bot only ever touches a copy while testing. Commands are in `SETUP.md` step 1. | 5 min |
| 2 | Vercel project on the copy | Vercel | Builds the preview links and the "production" site the bot checks. | 5 min |
| 3 | Turn off Vercel login on previews | Vercel, Project Settings, Deployment Protection | Otherwise the owner cannot open the preview link. Easy to miss. | 1 min |
| 4 | Fine-grained GitHub token, scoped to the test repo | GitHub, Developer settings | Lets the bot create branches, open and merge PRs, read deployments. | 3 min |
| 5 | Anthropic API key | Anthropic Console (billing on) | Understands plain-words requests. Small cost per message. | 2 min |
| 6 | An always-on host for the Node server | Render, Fly.io, Railway or a VPS | The chat needs a server that stays up. Add a persistent disk mounted at `data/` if offered. | 15 min |
| 7 | `clients.json` with a fresh `ownerKey` per client | Generate with `openssl rand -hex 24` | The owner's private password. Never commit the real file (it is in `.gitignore`). | 2 min |

Optional, later:

- A subdomain such as `editor.brobots.space` pointing at the host, so owners get a friendly link.
- Text or email intake. The brief says "text or email later". This build has the web widget only. Texting needs a number and a webhook (Twilio or similar), email needs an inbound address (Postmark, Mailgun or similar). Both would call the same `POST /api/chat`.
- For each new client: a token scoped to their repo, and their Vercel project's deployment protection checked.

Where each secret goes: `GITHUB_TOKEN` and `ANTHROPIC_API_KEY` in the host's environment variables (or `.env` locally), `ownerKey` in `clients.json`. None of them belong in the repo.
