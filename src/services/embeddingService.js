const crypto = require('crypto');
const { getConfig } = require('../config');

function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!magnitude) {
    return vector;
  }
  return vector.map((value) => value / magnitude);
}

function localEmbedding(text, dimensions = 64) {
  const vector = new Array(dimensions).fill(0);
  const tokens = String(text || '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) || [];

  for (const token of tokens) {
    const hash = crypto.createHash('sha1').update(token).digest();
    const index = hash.readUInt32BE(0) % dimensions;
    vector[index] += 1;
  }

  return normalizeVector(vector);
}

async function openAIEmbedding(text, model) {
  const { openAiApiKey } = getConfig();
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: text
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI embeddings request failed: ${errorText}`);
  }

  const payload = await response.json();
  return payload.data?.[0]?.embedding || [];
}

async function createEmbedding(text) {
  const config = getConfig();
  if (config.openAiApiKey) {
    return openAIEmbedding(text, config.openAiEmbeddingModel);
  }

  return localEmbedding(text);
}

module.exports = { createEmbedding, localEmbedding };
