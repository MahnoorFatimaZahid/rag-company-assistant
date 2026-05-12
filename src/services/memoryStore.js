const conversations = new Map();

function buildKey(tenantId, conversationId) {
  if (!tenantId || !conversationId) {
    return '';
  }

  return `${tenantId}:${conversationId}`;
}

function getConversation(tenantId, conversationId) {
  const key = buildKey(tenantId, conversationId);
  if (!key) {
    return [];
  }

  return conversations.get(key) || [];
}

function appendTurn(tenantId, conversationId, turn) {
  const key = buildKey(tenantId, conversationId);
  if (!key) {
    return [];
  }

  const existing = conversations.get(key) || [];
  const next = [...existing, turn].slice(-12);
  conversations.set(key, next);
  return next;
}

function getConversationSummaries(tenantId, conversationId) {
  return getConversation(tenantId, conversationId);
}

module.exports = {
  appendTurn,
  getConversation,
  getConversationSummaries
};