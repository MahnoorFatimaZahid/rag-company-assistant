const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { runAgentWorkflow } = require('../services/agentService');

function createAgentRouter() {
  const router = express.Router();

  router.use(requireAuth);

  router.post('/', async (req, res, next) => {
    try {
      const result = await runAgentWorkflow(req.body || {}, {
        tenantId: req.user.tenantId
      });

      res.json({
        tenantId: req.user.tenantId,
        ...result
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createAgentRouter };