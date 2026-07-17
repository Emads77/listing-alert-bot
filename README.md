# Listing Alert Bot

Get a Telegram notification within ~90 seconds when a new [Marktplaats](https://www.marktplaats.nl) listing matches your filters — keyword, price, and distance from your location.

Built because rare bikes get reserved within minutes of being listed. By the time you see them, they're gone. This bot watches for you, 24/7.

## How it works

```
┌─────────┐    ┌──────────────┐    ┌─────────┐    ┌──────────┐
│  fetch   │ →  │ deduplicate  │ →  │ filter  │ →  │  notify  │
│ (90s)    │    │  (SQLite)    │    │ (code)  │    │(Telegram)│
└─────────┘    └──────────────┘    └─────────┘    └──────────┘
```

1. **Fetch** — every 90 seconds, the bot requests the public search results page. Marktplaats server-side renders its listings into a `__NEXT_DATA__` JSON blob inside the HTML (it's a Next.js app). The bot extracts and parses that blob — no unofficial API wrappers, no headless browser.
2. **Deduplicate** — every listing has a stable `itemId` (e.g. `m2418707761`). Seen IDs are stored in SQLite; only unseen listings continue down the pipeline. Inserts use `INSERT OR IGNORE`, so the operation is idempotent and crash-safe.
3. **Filter** — max price and max distance are applied in code. Distance is computed with the haversine formula from the coordinates embedded in each listing (the website's own distance filter lives in the URL fragment, which is never sent to the server — so filtering client-side is the only way for an HTTP client).
4. **Notify** — new matches are pushed to a Telegram chat or group via the Bot API. Plain HTTP POST, no library.

On startup, the bot silently absorbs all current listings (no notification spam) and sends a single summary message confirming it's alive. From then on, only genuinely new listings trigger alerts.

### Why this architecture

- **Official Marktplaats API?** Investigated first — it's partner-only and explicitly scoped to your own advertisements ("Ads from other advertisers are not accessible"). Dead end, documented and ruled out.
- **Decoupled layers** — fetching, storage, filtering, and notification each live in their own module. Swapping Telegram for Discord, or Marktplaats for another marketplace, touches exactly one file.
- **Graceful failure** — if the page structure changes, extraction fails inside a try/catch, logs the error, and returns an empty list. The bot degrades to silence instead of crashing at 3 AM.

## Stack

Node.js (ESM) · better-sqlite3 · Telegram Bot API · deployed on Railway

## Setup

### 1. Telegram bot

1. Message [@BotFather](https://t.me/BotFather) → `/newbot` → copy the **token**
2. Message your new bot (or add it to a group and message there)
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy the `"chat":{"id":...}` value (group IDs are negative)

### 2. Configure

```bash
git clone git@github.com:Emads77/listing-alert-bot.git
cd listing-alert-bot
npm install
```

Create `.env`:

```
TG_TOKEN=your-bot-token
TG_CHAT=your-chat-id
```

Edit `config.js`:

```js
export const HOME = { lat: 53.2325, lng: 6.5392 };  // your coordinates
export const INTERVAL_MS = 90 * 1000;

export const SEARCHES = [
  { query: 'gazelle esprit', maxDistanceKm: 60 },
  { query: 'cortina', maxPriceCents: 50000, maxDistanceKm: 60 },
];
```

Each search supports `query` (required), `maxPriceCents`, and `maxDistanceKm` — omit a filter to skip it.

### 3. Run

```bash
npm start
```

Expected output:

```
bike-sniper running...
[gazelle esprit] got 30 listings
```

…and a ✅ summary message in your Telegram chat.

### 4. Deploy (Railway)

1. New Project → Deploy from GitHub repo
2. Add `TG_TOKEN` and `TG_CHAT` in the service's **Variables** tab
3. Done — `npm start` runs automatically

Note: Railway's filesystem is ephemeral, so the SQLite database resets on each redeploy. The startup-absorb behavior makes this harmless — the bot re-learns the current listings silently and continues.

## Project structure

```
main.js      orchestration loop
fetch.js     page fetch + __NEXT_DATA__ extraction
db.js        SQLite: isSeen / markSeen
geo.js       haversine distance
notify.js    Telegram delivery
config.js    searches, home location, interval
```

## Disclaimer

Educational and personal-use project. Automated access is against Marktplaats' Terms of Service; this tool polls at a low, human-like rate (one request per search per 90 seconds) and stores data locally for personal notification purposes only. Use at your own discretion. Not affiliated with Marktplaats.

## License

MIT