const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractTextFromUpload(file) {
  const originalName = file.originalname || 'document';
  const mimeType = file.mimetype || '';
  const buffer = file.buffer;
  const lowerName = originalName.toLowerCase();

  if (mimeType.includes('pdf') || lowerName.endsWith('.pdf')) {
    const parsed = await pdfParse(buffer);
    return normalizeExtractedText(parsed.text);
  }

  if (
    mimeType.includes('wordprocessingml.document') ||
    lowerName.endsWith('.docx')
  ) {
    const parsed = await mammoth.extractRawText({ buffer });
    return normalizeExtractedText(parsed.value);
  }

  if (mimeType.startsWith('text/') || lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
    return normalizeExtractedText(buffer.toString('utf8'));
  }

  const error = new Error(`Unsupported file type for ${originalName}`);
  error.statusCode = 400;
  throw error;
}

function normalizeExtractedText(text) {
  return String(text || '')
    .replace(/\u0000/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { extractTextFromUpload };
