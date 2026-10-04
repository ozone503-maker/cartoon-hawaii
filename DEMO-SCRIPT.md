# Demo script for the Services page

About two minutes, one screen: the chat on the left, the client's site on the right. Three requests, then the undo.

**Setup once:** run against the test copy (real demo) or `npm run demo` (works offline, uses the exact phrasings below). Open the site in one window and the chat in another.

## Beat 1: change a line of text

Owner types: `change our Saturday hours to 9-3`

Bot: *Got it. On the home page, change "Saturday: 10am - 2pm" to "Saturday: 9-3". Sound right? (yes / no)*

Owner: `yes`

Bot: *Staged. Nothing is live yet. Before: "Saturday: 10am - 2pm" / After: "Saturday: 9-3"* plus an **Open preview** button.

Show: click the preview, point at the new hours. Switch to the live site, point out it still says 10am - 2pm.

Owner: `approve`

Bot: *Approved and live. I checked the public site and your change is showing.*

Show: refresh the live site. Hours changed. Say: "No login, no editor, and the owner saw it before it went out."

## Beat 2: add a banner

Owner types: `add a banner saying "Closed Thursday for Thanksgiving"`

(With the Claude key set, a looser request like `put up a holiday banner, we're closed Thursday` should work too, and the confirm step lets the owner check the wording. Try it once before the demo. On the offline demo, quote the words.)

Then `yes`, open the preview, `approve`.

Show: the banner sits on top and uses the site's own look. Say: "It can't add new colors or fonts, that is checked on every edit."

## Beat 3: swap a photo

Click **Photo**, pick any image, then type: `swap the hero photo`

Bot: *Got it. On the home page, swap the picture hero.png for the one you just sent. Sound right?*

Then `yes`, preview, `approve`.

Show: new photo live. Mention the old file is still in the repo.

## Beat 4: the safety net

Owner types: `undo`

Bot: *Undone, and I checked the public site: it is back the way it was.*

Show: the site goes back to the photo. Then open the repo's `CHANGELOG.md`: every ask, what changed, who approved, including the undo. Say: "Every change is on a branch first, so nothing ever goes straight to the live site."

## Extra beats if there is time

- Type `delete the events section`. The bot says it does not delete in this version and touches nothing.
- Type `approve` with nothing waiting. It says nothing is waiting.
- Type `yes` while a preview is waiting. It does not publish; it asks for "approve".

## Suggested lines for the Services page card

- **Site Editor BroBot (add-on).** Tell it what to change in plain words. See the preview. Say "approve". Say "undo" if you change your mind.
- Works on: banners, text changes, photo swaps.
- Every change is logged with who approved it.
