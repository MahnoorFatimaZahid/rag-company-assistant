function stripHtml(input) {
  return String(input || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDuckDuckGoResults(html, limit = 5) {
  const results = [];
  const itemPattern = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = itemPattern.exec(html)) !== null && results.length < limit) {
    results.push({
      title: stripHtml(match[2]),
      url: match[1],
      snippet: stripHtml(match[3])
    });
  }

  return results;
}

async function searchWeb(query, options = {}) {
  const limit = Number(options.limit || 5);
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(String(query || '').trim())}`;
  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; rag-company-assistant/1.0)'
    }
  });

  if (!response.ok) {
    throw new Error(`Web search failed with status ${response.status}`);
  }

  const html = await response.text();
  const results = parseDuckDuckGoResults(html, limit);

  return {
    query,
    results
  };
}

module.exports = { searchWeb };