const { answerQuestion } = require('./ragService');
const { recordEvent } = require('./analyticsStore');

async function streamChatResponse(question, options = {}) {
  const config = require('../config').getConfig();
  const { recordEvent: recordEventFn } = require('./analyticsStore');

  const result = await answerQuestion(question, options);

  return {
    ...result,
    tokens: {
      prompt: Math.ceil(question.length / 4),
      completion: Math.ceil((result.answer || '').length / 4),
      total: Math.ceil((question.length + (result.answer || '').length) / 4)
    }
  };
}

module.exports = {
  streamChatResponse
};
