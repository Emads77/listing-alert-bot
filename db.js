// db.js
import Database from 'better-sqlite3';
const db = new Database('bikes.db');

db.exec(`

  CREATE TABLE IF NOT EXISTS seen_listings (
  
        item_id TEXT PRIMARY KEY,
        title TEXT,
        price_cents INTEGER,
        seen_at TEXT
        
)
`);

function isSeen(itemId) {
  const row = db.prepare('SELECT item_id FROM seen_listings WHERE item_id = ?').get(itemId);
  return !!row;
}

function markSeen(listing) {
  db.prepare(
    'INSERT OR IGNORE INTO seen_listings (item_id, title, price_cents, seen_at) VALUES (?, ?, ?, ?)'
  ).run(listing.itemId, listing.title, listing.priceInfo.priceCents, new Date().toISOString());
}

export { isSeen, markSeen };  // GAP 4 done for you