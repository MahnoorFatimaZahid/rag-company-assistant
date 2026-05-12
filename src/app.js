const express = require('express');
const cors = require('cors');
const path = require('path');

const { createAuthRouter } = require('./routes/auth');
const { createDocumentsRouter } = require('./routes/documents');
const { createChatRouter } = require('./routes/chat');
const { createAdminRouter } = require('./routes/admin');
const { requireAuth, requireRole } = require('./middleware/auth');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(path.join(__dirname, '../public')));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', createAuthRouter());
  app.use('/api/documents', createDocumentsRouter());
  app.use('/api/chat', createChatRouter());
  app.use('/api/admin', requireAuth, requireRole('admin'), createAdminRouter());

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({
      error: err.message || 'Internal server error'
    });
  });

  return app;
}

module.exports = { createApp };
