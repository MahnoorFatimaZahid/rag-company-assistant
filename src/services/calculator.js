function isSafeExpression(expression) {
  return /^[0-9+\-*/().,\s%^]+$/.test(expression);
}

function calculate(expression) {
  const input = String(expression || '').trim();
  if (!input) {
    throw new Error('Expression is required');
  }

  if (!isSafeExpression(input)) {
    throw new Error('Expression contains unsupported characters');
  }

  const normalized = input.replace(/\^/g, '**');
  const result = Function(`"use strict"; return (${normalized});`)();

  if (!Number.isFinite(result)) {
    throw new Error('Expression did not evaluate to a finite number');
  }

  return Number(result.toFixed(8));
}

module.exports = { calculate };