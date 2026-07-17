export async function fetchListings(query) {
  try {
    const res = await fetch(`https://www.marktplaats.nl/q/${encodeURIComponent(query)}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36' }
    });
    const html = await res.text();

    const marker = '<script id="__NEXT_DATA__" type="application/json"';
    const start = html.indexOf(marker);
    if (start === -1) throw new Error('__NEXT_DATA__ not found (blocked or layout changed)');
    const jsonStart = html.indexOf('>', start) + 1;
    const jsonEnd = html.indexOf('</script>', jsonStart);
    const data = JSON.parse(html.slice(jsonStart, jsonEnd));

    // find searchRequestAndResponse without depending on exact key names
    const pageProps = data.props.pageProps;
    const container = Object.values(pageProps).find(v => v && typeof v === 'object' && v.searchRequestAndResponse) 
                      ?? (pageProps.searchRequestAndResponse ? pageProps : null);
    if (!container) throw new Error('listings container not found');
    return container.searchRequestAndResponse.listings ?? [];
  } catch (err) {
    console.error(`[fetch] ${query}: ${err.message}`);
    return [];
  }
}