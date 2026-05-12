function cosineSimilarity(left, right) {
  const length = Math.min(left.length, right.length);
  if (!length) {
    return 0;
  }

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] || 0;
    const rightValue = right[index] || 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (!leftMagnitude || !rightMagnitude) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

class InMemoryVectorStore {
  constructor(records = [], options = {}) {
    this.records = Array.isArray(records) ? records : [];
    this.onChange = typeof options.onChange === 'function' ? options.onChange : null;
  }

  notifyChange() {
    if (this.onChange) {
      this.onChange(this.getAll());
    }
  }

  add(record) {
    this.records.push(record);
    this.notifyChange();
  }

  addMany(records) {
    for (const record of records) {
      this.records.push(record);
    }
    this.notifyChange();
  }

  removeByDocumentId(documentId, tenantId) {
    const before = this.records.length;
    this.records = this.records.filter((record) => {
      if (record.documentId !== documentId) {
        return true;
      }

      if (tenantId && record.tenantId !== tenantId) {
        return true;
      }

      return false;
    });

    const removed = before - this.records.length;
    if (removed > 0) {
      this.notifyChange();
    }

    return removed;
  }

  getAll() {
    return [...this.records];
  }

  search(queryVector, limit = 5, predicate = () => true) {
    return this.records
      .filter(predicate)
      .map((record) => ({
        ...record,
        score: cosineSimilarity(queryVector, record.embedding)
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, limit);
  }

  count() {
    return this.records.length;
  }
}

module.exports = { InMemoryVectorStore, cosineSimilarity };
