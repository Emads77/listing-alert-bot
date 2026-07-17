// main.js
import 'dotenv/config';
import { fetchListings } from './fetch.js';
import { isSeen, markSeen } from './db.js';
import { notify } from './notify.js';
import { distanceKm } from './geo.js';
import { SEARCHES, INTERVAL_MS, HOME } from './config.js';

let firstRun = true;

async function checkAll() {
  for (const s of SEARCHES) {
    const listings = await fetchListings(s.query);
    console.log(`[${s.query}] got ${listings.length} listings`);


    for (const l of listings) {
      if (!l.itemId || isSeen(l.itemId)) continue;

      // price filter (only if the search defines one)
      const price = l.priceInfo?.priceCents ?? 0;
      if (s.maxPriceCents && price > s.maxPriceCents) { markSeen(l); continue; }

      // distance filter (only if the search defines one and the listing has coords)
      if (s.maxDistanceKm && l.location?.latitude) {
        const d = distanceKm(HOME.lat, HOME.lng, l.location.latitude, l.location.longitude);
        if (d > s.maxDistanceKm) { markSeen(l); continue; }
      }

      markSeen(l);
       //if (firstRun) continue; // first cycle: absorb existing listings silently

      const link = l.vipUrl
        ? 'https://www.marktplaats.nl' + l.vipUrl
        : `https://www.marktplaats.nl/v/a/${l.itemId.slice(1)}`;

      await notify(
        `🚲 ${l.title}\n` +
        `💶 €${(price / 100).toFixed(2)}\n` +
        `📍 ${l.location?.cityName ?? '?'}\n` +
        `🔗 ${link}`
      );
    }
  }
  firstRun = false;
}

console.log('bike-sniper running...');
await checkAll();
setInterval(checkAll, INTERVAL_MS);