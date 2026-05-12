const express = require('express');
const multer = require('multer');
const { ingestFile, getDocumentsByTenant, searchDocuments, deleteDocument } = require('../services/ragService');
const { requireAuth } = require('../middleware/auth');
const { getConfig } = require('../config');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: getConfig().maxUploadBytes, files: 10 }
});

function createDocumentsRouter() {
  const router = express.Router();

  router.use(requireAuth);

  router.get('/', (req, res) => {
    res.json({ documents: getDocumentsByTenant(req.user.tenantId) });
  });

  router.get('/search', async (req, res, next) => {
    try {
      const query = String(req.query.q || '').trim();
      if (!query) {
        return res.status(400).json({ error: 'q is required' });
      }

      const results = await searchDocuments(query, {
        topK: Number(req.query.topK || getConfig().retrievalTopK),
        tenantId: req.user.tenantId,
        filters: {
          department: req.query.department,
          fileType: req.query.fileType,
          tag: req.query.tag,
          documentId: req.query.documentId
        }
      });

      res.json({
        query,
        results
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/upload', upload.array('files', 10), async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Upload at least one file.' });
      }

      const metadata = {
        department: req.body?.department,
        tags: req.body?.tags,
        tenantId: req.user.tenantId
      };

      const results = [];
      for (const file of req.files) {
        results.push(await ingestFile(file, metadata));
      }

      res.status(201).json({
        message: 'Documents indexed successfully.',
        documents: results
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:documentId', (req, res) => {
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

  return router;
}

module.exports = { createDocumentsRouter };
