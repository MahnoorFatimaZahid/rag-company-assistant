const { answerQuestion, searchDocuments } = require('./ragService');

function buildPlan() {
  return [
    'Generate query embedding',
    'Search tenant-scoped company vector store',
    'Retrieve relevant chunks',
    'Inject retrieved context into the controlled prompt',
    'Return a grounded response with citations'
  ];
}

async function runAgentWorkflow(input = {}, options = {}) {
  const objective = String(input.objective || input.message || '').trim();
  if (!objective) {
    throw new Error('objective is required');
  }

  const tenantId = String(options.tenantId || input.tenantId || 'default').trim() || 'default';
  const topK = Number(input.topK || 4);
  const filters = input.filters || {};

  const retrievalPreview = await searchDocuments(objective, { tenantId, topK, filters });
  const response = await answerQuestion(objective, {
    tenantId,
    topK,
    filters,
    conversationId: input.conversationId
  });

  return {
    mode: 'controlled-rag',
    plan: buildPlan(),
    toolsUsed: ['company-document-retrieval'],
    steps: [
      { role: 'retrieval', action: 'search company documents', detail: `found ${retrievalPreview.length} candidate chunk(s)` },
      { role: 'generation', action: 'answer from retrieved context', detail: `${response.sources.length} cited source(s)` }
    ],
    answer: response.answer,
    sources: response.sources,
    conversationId: response.conversationId
  };
}

module.exports = {
  runAgentWorkflow,
  buildPlan
};
