const { randomUUID } = require('crypto');
const { splitTextIntoChunks } = require('./chunker');
const { extractTextFromUpload } = require('./textExtractor');
const { createEmbedding } = require('./embeddingService');
const { InMemoryVectorStore } = require('./vectorStore');
const { appendTurn, getConversationSummaries } = require('./memoryStore');
const { recordEvent } = require('./analyticsStore');
const { getConfig } = require('../config');
const { loadKnowledgeStore, saveKnowledgeStore } = require('./knowledgeStore');

const persistedKnowledge = loadKnowledgeStore();
const uploadedDocuments = new Map(
  persistedKnowledge.documents.map((document) => [document.documentId, document])
);
const vectorStore = new InMemoryVectorStore(persistedKnowledge.chunks, {
  onChange: (chunks) => persistKnowledge(chunks)
});

function persistKnowledge(chunks = vectorStore.getAll()) {
  saveKnowledgeStore({
    documents: Array.from(uploadedDocuments.values()),
    chunks
  });
}

const KEYWORD_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
  'how', 'i', 'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to',
  'was', 'what', 'when', 'where', 'which', 'who', 'why', 'with'
]);

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  const normalized = normalizeText(text);
  return normalized
    ? normalized.split(' ').filter((token) => token.length > 2 && !KEYWORD_STOP_WORDS.has(token))
    : [];
}

function parseTags(tags) {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(tags)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildPredicate(filters = {}) {
  const department = normalizeText(filters.department);
  const fileType = normalizeText(filters.fileType);
  const tag = normalizeText(filters.tag);
  const documentId = String(filters.documentId || '').trim();

  return (record) => {
    if (documentId && record.documentId !== documentId) {
      return false;
    }

    if (department && normalizeText(record.metadata?.department) !== department) {
      return false;
    }

    if (fileType && normalizeText(record.metadata?.mimeType) !== fileType && normalizeText(record.metadata?.fileType) !== fileType) {
      return false;
    }

    if (tag) {
      const tags = record.metadata?.tags || [];
      const matchesTag = tags.some((item) => normalizeText(item) === tag);
      if (!matchesTag) {
        return false;
      }
    }

    return true;
  };
}

function sanitizeTopK(value) {
  const configured = getConfig().retrievalTopK;
  const requested = Number(value || configured);
  if (!Number.isFinite(requested)) {
    return configured;
  }

  return Math.min(Math.max(Math.floor(requested), 1), 10);
}

function hasEnoughSignal(matches) {
  if (!matches.length) {
    return false;
  }

  const minScore = getConfig().retrievalMinScore;
  return matches.some((match) => {
    const keywordComponent = match.keywordScore || 0;
    return (match.score >= minScore && keywordComponent >= 0.08) || match.score >= 0.25;
  });
}

function keywordScore(query, text) {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) {
    return 0;
  }

  const textTokens = new Set(tokenize(text));
  let overlap = 0;

  for (const token of queryTokens) {
    if (textTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / queryTokens.size;
}

function combineScores(vectorScore, keywordComponent) {
  return Number((vectorScore * 0.7 + keywordComponent * 0.3).toFixed(6));
}

function formatContext(matches) {
  const maxChars = getConfig().maxContextChars;
  let usedChars = 0;

  return matches
    .map((match, index) => {
      const tags = match.metadata?.tags?.length ? `, tags: ${match.metadata.tags.join(', ')}` : '';
      const department = match.metadata?.department ? `, department: ${match.metadata.department}` : '';
      const sourceHeader = `Source ${index + 1} (${match.fileName}, chunk ${match.chunkIndex + 1}${department}${tags}):\n`;
      const remainingChars = maxChars - usedChars - sourceHeader.length;
      if (remainingChars <= 0) {
        return '';
      }

      const text = match.text.slice(0, remainingChars);
      usedChars += sourceHeader.length + text.length;
      return `${sourceHeader}${text}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

async function ingestFile(file, metadata = {}) {
  const text = await extractTextFromUpload(file);
  const chunks = splitTextIntoChunks(text);
  if (chunks.length === 0) {
    const error = new Error(`No readable text found in ${file.originalname}`);
    error.statusCode = 400;
    throw error;
  }

  const documentId = randomUUID();
  const uploadedAt = new Date().toISOString();
  const documentTags = parseTags(metadata.tags);
  const tenantId = String(metadata.tenantId || 'default').trim() || 'default';
  const storedChunks = [];

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    const embedding = await createEmbedding(chunk);
    const record = {
      id: randomUUID(),
      documentId,
      fileName: file.originalname,
      chunkIndex: index,
      text: chunk,
      embedding,
      tenantId,
      metadata: {
        mimeType: file.mimetype,
        fileType: file.originalname.split('.').pop() || '',
        size: file.size,
        department: metadata.department || '',
        tags: documentTags,
        uploadedAt
      }
    };

    storedChunks.push(record);
  }

  const documentRecord = {
    documentId,
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    tenantId,
    department: metadata.department || '',
    tags: documentTags,
    chunkCount: storedChunks.length,
    textLength: text.length,
    createdAt: uploadedAt
  };

  uploadedDocuments.set(documentId, documentRecord);
  vectorStore.addMany(storedChunks);
  recordEvent({
    type: 'document.uploaded',
    tenantId,
    documentId,
    fileName: file.originalname
  });

  return {
    ...documentRecord,
    sampleChunks: storedChunks.slice(0, 3).map((chunk) => ({
      chunkIndex: chunk.chunkIndex,
      text: chunk.text.slice(0, 200)
    }))
  };
}

async function searchKnowledgeBase(question, options = {}) {
  const queryEmbedding = await createEmbedding(question);
  const predicate = buildPredicate(options.filters);
  const topK = sanitizeTopK(options.topK);
  const tenantId = String(options.tenantId || 'default').trim() || 'default';
  const candidateLimit = Math.max(topK * 3, topK);

  const ranked = vectorStore
    .search(queryEmbedding, candidateLimit, (record) => record.tenantId === tenantId && predicate(record))
    .map((match) => {
      const keywordComponent = keywordScore(question, `${match.text} ${match.fileName} ${match.metadata?.department || ''} ${(match.metadata?.tags || []).join(' ')}`);
      return {
        ...match,
        score: combineScores(match.score, keywordComponent),
        keywordScore: Number(keywordComponent.toFixed(6))
      };
    })
    .sort((left, right) => right.score - left.score);

  return ranked.slice(0, topK);
}

async function answerQuestion(question, options = {}) {
  const config = getConfig();
  const tenantId = String(options.tenantId || 'default').trim() || 'default';
  const conversationId = options.conversationId || randomUUID();
  const conversationHistory = getConversationSummaries(tenantId, conversationId);
  const retrievalQuestion = [
    conversationHistory.slice(-4).map((turn) => `${turn.role}: ${turn.content}`).join('\n'),
    question
  ].filter(Boolean).join('\n');

  const matches = await searchKnowledgeBase(retrievalQuestion, { ...options, tenantId });
  const context = formatContext(matches);
  const historyForPrompt = conversationHistory.slice(-6).map((turn) => ({ role: turn.role, content: turn.content }));

  appendTurn(tenantId, conversationId, { role: 'user', content: question, createdAt: new Date().toISOString() });

  if (!hasEnoughSignal(matches)) {
    const answer = 'I do not have enough relevant company document context to answer that. Please upload or select the right company documents and try again.';
    appendTurn(tenantId, conversationId, { role: 'assistant', content: answer, createdAt: new Date().toISOString() });
    recordEvent({
      type: 'chat.refused',
      tenantId,
      conversationId,
      sourceCount: matches.length
    });

    return {
      tenantId,
      conversationId,
      answer,
      sources: []
    };
  }

  if (config.openAiApiKey) {
    const messages = [
      {
        role: 'system',
        content: [
          'You are a controlled company knowledge assistant.',
          'Answer only from the provided document context and visible conversation history.',
          'Do not use outside knowledge, web results, speculation, or tool calls.',
          'If the context does not contain the answer, say you do not have enough company document context.',
          'Include concise source citations such as [Source 1] for factual claims.'
        ].join(' ')
      },
      ...historyForPrompt,
      {
        role: 'user',
        content: `Question: ${question}\n\nCompany document context:\n${context}`
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.openAiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.openAiChatModel,
        messages,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI chat request failed: ${errorText}`);
    }

    const payload = await response.json();
    const answer = payload.choices?.[0]?.message?.content || 'No answer returned.';
    appendTurn(tenantId, conversationId, { role: 'assistant', content: answer, createdAt: new Date().toISOString() });
    recordEvent({
      type: 'chat.completed',
      tenantId,
      conversationId,
      sourceCount: matches.length
    });
    return {
      tenantId,
      conversationId,
      answer,
      sources: matches.map((match, index) => ({
        sourceId: index + 1,
        documentId: match.documentId,
        fileName: match.fileName,
        chunkIndex: match.chunkIndex,
        score: Number(match.score.toFixed(4)),
        keywordScore: Number((match.keywordScore || 0).toFixed(4)),
        department: match.metadata?.department || '',
        tags: match.metadata?.tags || [],
        snippet: match.text.slice(0, 320)
      }))
    };
  }

  const answer = `I found ${matches.length} relevant company document chunk(s). Without an OpenAI API key configured, I can only return the retrieved context for review.\n\n${context}`;

  appendTurn(tenantId, conversationId, { role: 'assistant', content: answer, createdAt: new Date().toISOString() });
  recordEvent({
    type: 'chat.completed',
    tenantId,
    conversationId,
    sourceCount: matches.length
  });

  return {
    tenantId,
    conversationId,
    answer,
    sources: matches.map((match, index) => ({
      sourceId: index + 1,
      documentId: match.documentId,
      fileName: match.fileName,
      chunkIndex: match.chunkIndex,
      score: Number(match.score.toFixed(4)),
      keywordScore: Number((match.keywordScore || 0).toFixed(4)),
      department: match.metadata?.department || '',
      tags: match.metadata?.tags || [],
      snippet: match.text.slice(0, 320)
    }))
  };
}

function getDocuments() {
  return Array.from(uploadedDocuments.values());
}

function getDocumentsByTenant(tenantId) {
  return getDocuments().filter((document) => !tenantId || document.tenantId === tenantId);
}

function deleteDocument(documentId, tenantId) {
  const document = uploadedDocuments.get(documentId);
  if (!document) {
    return { deleted: false, removedChunks: 0 };
  }

  if (tenantId && document.tenantId !== tenantId) {
    return { deleted: false, removedChunks: 0 };
  }

  uploadedDocuments.delete(documentId);
  const removedChunks = vectorStore.removeByDocumentId(documentId, tenantId);
  persistKnowledge();
  recordEvent({
    type: 'document.deleted',
    tenantId: document.tenantId,
    documentId,
    fileName: document.fileName
  });

  return { deleted: true, removedChunks };
}

function searchDocuments(query, options = {}) {
  return searchKnowledgeBase(query, options).then((matches) => matches.map((match) => ({
    documentId: match.documentId,
    fileName: match.fileName,
    chunkIndex: match.chunkIndex,
    text: match.text,
    score: Number(match.score.toFixed(4)),
    keywordScore: Number((match.keywordScore || 0).toFixed(4)),
    department: match.metadata?.department || '',
    tags: match.metadata?.tags || [],
    mimeType: match.metadata?.mimeType || ''
  })));
}

function getConversationHistory(tenantId, conversationId) {
  return getConversationSummaries(tenantId, conversationId);
}

module.exports = {
  ingestFile,
  answerQuestion,
  getDocuments,
  getDocumentsByTenant,
  deleteDocument,
  searchDocuments,
  getConversationHistory
};
