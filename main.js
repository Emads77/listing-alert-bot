// main.js
import 'dotenv/config';
import { fetchListings } from './fetch.js';
import { isSeen, markSeen } from './db.js';
import { notify } from './notify.js';
import { distanceKm } from './geo.js';
import { SEARCHES, INTERVAL_MS, HOME,BLOCKED_SELLERS } from './config.js';


let firstRun = true;

async function checkAll() {
  for (const s of SEARCHES) {
    const listings = await fetchListings(s.query);
    console.log(`[${s.query}] got ${listings.length} listings`);


  for (const listing of listings) {
  if (!listing.itemId || isSeen(listing.itemId)) continue;
      markSeen(listing.itemId);

 
      if (BLOCKED_SELLERS.has(listing.sellerInformation?.sellerId)) continue;

      const price = listing.priceInfo?.priceCents ?? 0;
      if (s.maxPriceCents && price > s.maxPriceCents) continue;

      if (s.maxDistanceKm && listing.location?.latitude) {
        const d = distanceKm(HOME.lat, HOME.lng, listing.location.latitude, listing.location.longitude);
        if (d > s.maxDistanceKm) continue;
      }

      if (firstRun) continue; // first cycle: absorb existing listings silently

      const link = listing.vipUrl
        ? 'https://www.marktplaats.nl' + listing.vipUrl
        : `https://www.marktplaats.nl/v/a/${listing.itemId.slice(1)}`;

      await notify(
        `🚲 ${listing.title}\n` +
        `💶 €${(price / 100).toFixed(2)}\n` +
        `📍 ${listing.location?.cityName ?? '?'}\n` +
        `🔗 ${link}`
      );
    }
  }
  firstRun = false;
}

console.log('bike-sniper running...');
await checkAll();
setInterval(checkAll, INTERVAL_MS);