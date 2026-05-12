function splitTextIntoChunks(text, options = {}) {
  const chunkSize = options.chunkSize || 1000;
  const overlap = options.overlap || 200;

  const normalized = String(text || '').replace(/\r\n/g, '\n').replace(/[\t ]+/g, ' ').trim();
  if (!normalized) {
    return [];
  }

  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);
    if (end < normalized.length) {
      const sentenceBreak = normalized.lastIndexOf('. ', end);
      const newlineBreak = normalized.lastIndexOf('\n', end);
      const breakPoint = Math.max(sentenceBreak, newlineBreak);
      if (breakPoint > start + Math.floor(chunkSize * 0.6)) {
        end = breakPoint + 1;
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(0, end - overlap);
  }

  return chunks;
}

module.exports = { splitTextIntoChunks };
