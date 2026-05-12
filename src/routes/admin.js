const express = require('express');
const { getDocumentsByTenant, deleteDocument } = require('../services/ragService');
const { getAnalytics, recordEvent } = require('../services/analyticsStore');
const { listUsers } = require('../services/userStore');
const { listJobs, processJobQueue } = require('../services/jobQueue');

function createAdminRouter() {
  const router = express.Router();

  router.get('/analytics', (req, res) => {
    res.json({
      tenantId: req.user.tenantId,
      analytics: getAnalytics({ tenantId: req.user.tenantId })
    });
  });

  router.get('/users', (req, res) => {
    res.json({
      tenantId: req.user.tenantId,
      users: listUsers(req.user.tenantId)
    });
  });

  router.get('/documents', (req, res) => {
    res.json({
      tenantId: req.user.tenantId,
      documents: getDocumentsByTenant(req.user.tenantId)
    });
  });

  router.delete('/documents/:documentId', (req, res) => {
    const result = deleteDocument(req.params.documentId, req.user.tenantId);
    if (!result.deleted) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      message: 'Document deleted',
      documentId: req.params.documentId,
      removedChunks: result.removedChunks
    });
  });

  router.get('/jobs', (req, res) => {
    res.json({
      tenantId: req.user.tenantId,
      jobs: listJobs()
    });
  });

  router.post('/jobs/process', async (req, res) => {
    try {
      await processJobQueue(async (job) => {
        recordEvent({ type: 'job.processed', tenantId: req.user.tenantId, jobId: job.id, jobType: job.type });
        return { processed: true };
      });
      res.json({ message: 'Jobs processed', totalJobs: listJobs().length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = { createAdminRouter };