# Site Editor BroBot

A chat agent that edits a client's website when the owner asks in plain words. It shows a preview of exactly what will change, waits for "approve", then publishes. The owner never logs into anything.

```
owner: change our Saturday hours to 9-3
bot:   Got it. On the home page, change "Saturday: 10am - 2pm" to "Saturday: 9-3". Sound right?
owner: yes
bot:   Staged. Nothing is live yet.  Before / After  [Open preview]
owner: approve
bot:   Approved and live. I checked the public site and your change is showing.
owner: undo
bot:   Undone, and I checked the public site: it is back the way it was.
```

## What it does today

| Request | How it edits |
|---|---|
| Add a banner | New bar at the top of the home page. Styled only from the page's own CSS, so no new colors or fonts. A second banner request updates the first instead of stacking. |
| Edit a line of text | Finds the words in the visible text of a page and swaps just those characters. |
| Swap an image | Uploads the new picture next to the old one (`images/name-<timestamp>.png`) and points the `<img>` at it. The old picture stays in the repo. |

Also: `undo` (puts the previous version back, through its own PR), `cancel`, `preview`, `help`.

## How a change travels

1. Owner message arrives at `POST /api/chat` (widget or anything that can send JSON).
2. The language model (or the built-in rule parser, for demos) turns it into one structured edit.
3. The bot checks the edit against the current site and says what it understood. Nothing is touched yet.
4. On "yes": new branch `brobot/<time>-<kind>`, smallest possible edit, then every written file is read back and compared byte for byte, and the file list is compared to `main` to be sure nothing vanished.
5. PR opened, Vercel builds the preview, owner gets the link plus a before/after.
6. On "approve": `CHANGELOG.md` gets an entry (what was asked, what changed, who approved) on the same branch, the PR is squash-merged, and the bot fetches the public page until the change shows up.
7. On "undo": a new branch restores the files from before the merge, refusing if someone edited the page again in between. The owner's "undo" is the approval for that revert.

Safety checks that run on every edit (`src/edits.js`, `verifyEdit`): file not blank, not shrunk, no placeholder text, no lost sections or headings, no new colors, fonts, scripts, stylesheets or imports, and a small diff. The GitHub client cannot delete a file and refuses to write to the default branch.

## Try it with no accounts

```
npm run demo
```

Open the URL it prints. It runs the whole flow against an in-memory copy of `fixtures/site`, with the preview and "live" site served locally. Uses the rule-based parser, so type the demo phrasings from `DEMO-SCRIPT.md`.

```
npm test        # 68 tests, no network needed
```

## Run it for real

See `SETUP.md` (test-copy repo, Vercel, GitHub token, hosting) and `ACCOUNTS.md` (everything that needs Jessie's logins).

## Layout

```
src/edits.js      pure HTML edits + verification (no network)
src/agent.js      the conversation and the branch/preview/approve/undo flow
src/github.js     GitHub REST client   src/fake.js  in-memory twin for tests/demo
src/llm.js        Claude call (forced tool use)   src/mock.js  rule parser for demos
src/live.js       "is it live yet?" check
src/server.js     HTTP + auth + widget   public/  chat widget
test/             node:test suites   fixtures/site  the sample static site
```

Zero npm dependencies. Node 22 or newer.

## Known limits (first version)

- One change at a time. If the same words appear in several places (a phone number in every footer), it asks for a longer piece of the line instead of guessing.
- Text edits must sit inside one text node. Words split across bold or links need a narrower phrase.
- Banner goes on the home page only. No banner removal yet (use `undo`, or ask for a new banner).
- Deleting pages or sections is refused in this version. The double-confirm delete flow is the obvious next piece.
- Background-image and `<picture>` swaps are declined with a plain message.
- Sessions live in `data/<client>.json`. On a host without a persistent disk, a restart forgets what "undo" refers to.
- Checked against an in-memory fake of GitHub and against stubbed GitHub, Vercel and Claude responses. Not yet run against the real ones. That is what the test copy is for.
