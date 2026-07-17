// fetch.js
export async function fetchListings(query) {
  try {
    const url = `https://www.marktplaats.nl/lrp/api/search?limit=30&offset=0` +
                `&query=${encodeURIComponent(query)}` +
                `&searchInTitleAndDescription=true` +
                `&sortBy=SORT_INDEX&sortOrder=DECREASING`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.listings ?? [];
  } catch (err) {
    console.error(`[fetch] ${query}: ${err.message}`);
    return [];
  }
}