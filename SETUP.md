# Setup: from zero to a working test on a copy of the site

Do this against a copy of `ozone503-maker/brobots-space-academy`. The live repo is not needed at any point.

## 1. Make the test copy (5 min)

Create an empty repo on GitHub named `brobots-space-academy-test` (no README, no license). Then:

```
git clone --bare https://github.com/ozone503-maker/brobots-space-academy.git
cd brobots-space-academy.git
git push --all https://github.com/ozone503-maker/brobots-space-academy-test.git
cd .. && rm -rf brobots-space-academy.git
```

Check that the test repo's default branch is `main` and that the site is plain HTML/CSS at the root (or in a folder, either works, the bot finds every `.html` file).

## 2. Vercel project for the copy (5 min)

1. Vercel dashboard, Add New Project, import `brobots-space-academy-test`. Framework preset "Other", no build command needed for plain HTML.
2. Confirm the Vercel GitHub app is installed on that repo. Preview deployments on pull requests are on by default.
3. **Project Settings, Deployment Protection:** set Vercel Authentication to "Only Production Deployments" (or off) for this project. If previews stay behind Vercel login, the owner clicks the preview link and hits a sign-in wall.
4. Note the production URL, for example `https://brobots-space-academy-test.vercel.app`. It goes in `clients.json` as `siteUrl`.

## 3. GitHub token (3 min)

GitHub, Settings, Developer settings, Fine-grained personal access tokens, Generate new token:

- Repository access: **Only select repositories**, pick `brobots-space-academy-test`
- Permissions: Contents **Read and write**, Pull requests **Read and write**, Deployments **Read**
- If the bot ever logs a 403 while looking for the preview link, also add Issues **Read**

The token can only touch the test repo. When you move to a real client, make a new token scoped to that client's repo.

On the test repo, branch protection on `main` is fine as long as it does not require approving reviews or status checks, because the bot merges its own PRs after the owner says "approve".

## 4. Anthropic key (2 min)

Create an API key in the Anthropic Console. Without it the bot falls back to a simple rule parser that only understands the demo phrasings. The default model is `claude-sonnet-5`; set `ANTHROPIC_MODEL` to change it.

## 5. Configure and run it

```
npm test                          # should print: pass 68, fail 0
cp .env.example .env              # paste GITHUB_TOKEN and ANTHROPIC_API_KEY
cp clients.example.json clients.json
```

Edit `clients.json`: set `siteUrl`, `ownerName`, and replace `ownerKey` with a fresh secret from `openssl rand -hex 24`. That key is the owner's password. Then:

```
npm start
```

Open `http://localhost:8787/?client=ozone-test&key=<the ownerKey>`. The page stores the key in the browser and removes it from the address bar.

## 6. First check on the copy

Run the three requests from `DEMO-SCRIPT.md`. After each "approve", confirm on GitHub that the PR merged, `CHANGELOG.md` has the new entry, and the Vercel production site shows the change. Then say "undo" and confirm it goes back.

## 7. Put it somewhere always-on

The bot is a small Node 22 server, not a Vercel function (it keeps a short conversation state and a session file). Any always-on host works: Render, Fly.io, Railway, or a small VPS. Give it the same two environment variables, upload `clients.json`, and if the host offers a persistent disk, mount it at `data/`. Serve it over https, since the owner key travels in a header.

To embed the chat on a client's own page instead of using the hosted page, add the client's origin to `allowedOrigins` in `clients.json` and load `/widget.js`:

```html
<div id="editor" style="height:560px"></div>
<script src="https://YOUR-HOST/widget.js"></script>
<script>BrobotEditor.mount({ endpoint: 'https://YOUR-HOST/api/chat', client: 'ozone-test', key: OWNER_KEY, target: document.getElementById('editor') });</script>
```

Keep that page private to the owner, since anyone holding the key can request edits (they still cannot publish without the approval step, but they are the owner's voice).

## Adding a real client later

Add an entry to `clients.json` (own repo, own `ownerKey`, own `siteUrl`), create a token scoped to that repo, restart. Each client gets its own session file and its own `CHANGELOG.md`.
