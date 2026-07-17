import Database from 'better-sqlite3';
const db = new Database('bikes.db');
console.log(db.prepare('SELECT item_id, title, price_cents FROM seen_listings').all());