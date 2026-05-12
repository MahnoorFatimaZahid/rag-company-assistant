function getConfig() {
  return {
    port: Number(process.env.PORT || 3000),
    openAiApiKey: process.env.OPENAI_API_KEY || '',
    openAiChatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4.1-mini',
    openAiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    retrievalTopK: Number(process.env.RETRIEVAL_TOP_K || 4),
    retrievalMinScore: Number(process.env.RETRIEVAL_MIN_SCORE || 0.05),
    maxContextChars: Number(process.env.MAX_CONTEXT_CHARS || 12000),
    maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024),
    knowledgeStorePath: process.env.KNOWLEDGE_STORE_PATH || 'data/knowledge-store.json'
  };
}

module.exports = { getConfig };
