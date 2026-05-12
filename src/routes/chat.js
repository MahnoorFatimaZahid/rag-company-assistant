const express = require('express');
const { answerQuestion } = require('../services/ragService');
const { recordEvent } = require('../services/analyticsStore');
const { requireAuth } = require('../middleware/auth');
const { getConfig } = require('../config');

function createChatRouter() {
  const router = express.Router();

  router.use(requireAuth);

  router.post('/', async (req, res, next) => {
    try {
      const message = String(req.body?.message || '').trim();
      if (!message) {
        return res.status(400).json({ error: 'message is required' });
      }

      const result = await answerQuestion(message, {
        conversationId: req.body?.conversationId,
        topK: Number(req.body?.topK || getConfig().retrievalTopK),
        filters: req.body?.filters || {},
        tenantId: req.user.tenantId
      });

      const promptTokens = Math.ceil(message.length / 4);
      const completionTokens = Math.ceil((result.answer || '').length / 4);
      const totalTokens = promptTokens + completionTokens;

      recordEvent({
        type: 'chat.tokens',
        tenantId: req.user.tenantId,
        promptTokens,
        completionTokens,
        totalTokens
      });

      res.json({
        message,
        ...result,
        tokens: { promptTokens, completionTokens, totalTokens }
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createChatRouter };
