const fs = require('fs');
const path = require('path');
const { getConfig } = require('../config');

function resolveStorePath() {
  const configuredPath = getConfig().knowledgeStorePath;
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);
}

function createEmptyStore() {
  return {
    version: 1,
    documents: [],
    chunks: []
  };
}

function loadKnowledgeStore() {
  const storePath = resolveStorePath();
  if (!fs.existsSync(storePath)) {
    return createEmptyStore();
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    return {
      version: parsed.version || 1,
      documents: Array.isArray(parsed.documents) ? parsed.documents : [],
      chunks: Array.isArray(parsed.chunks) ? parsed.chunks : []
    };
  } catch (error) {
    console.warn(`Knowledge store could not be loaded: ${error.message}`);
    return createEmptyStore();
  }
}

function saveKnowledgeStore(store) {
  const storePath = resolveStorePath();
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(
    storePath,
    JSON.stringify({
      version: 1,
      documents: Array.isArray(store.documents) ? store.documents : [],
      chunks: Array.isArray(store.chunks) ? store.chunks : []
    }, null, 2)
  );
}

module.exports = {
  loadKnowledgeStore,
  saveKnowledgeStore
};
