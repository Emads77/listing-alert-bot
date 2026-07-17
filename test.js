import { isSeen, markSeen } from './db.js';
markSeen({ itemId: 'm123', title: 'test', priceInfo: { priceCents: 1000 } });
console.log(isSeen('m123'));  // true
console.log(isSeen('m999'));  // false