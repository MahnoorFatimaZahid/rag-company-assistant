const { randomUUID } = require('crypto');

const jobs = new Map();
const jobQueue = [];

class Job {
  constructor(id, type, payload) {
    this.id = id;
    this.type = type;
    this.payload = payload;
    this.status = 'pending';
    this.result = null;
    this.error = null;
    this.createdAt = new Date().toISOString();
    this.startedAt = null;
    this.completedAt = null;
  }

  start() {
    this.status = 'processing';
    this.startedAt = new Date().toISOString();
  }

  complete(result) {
    this.status = 'completed';
    this.result = result;
    this.completedAt = new Date().toISOString();
  }

  fail(error) {
    this.status = 'failed';
    this.error = String(error);
    this.completedAt = new Date().toISOString();
  }
}

async function enqueueJob(type, payload) {
  const jobId = randomUUID();
  const job = new Job(jobId, type, payload);
  jobs.set(jobId, job);
  jobQueue.push(job);
  return jobId;
}

function getJob(jobId) {
  return jobs.get(jobId) || null;
}

function listJobs() {
  return Array.from(jobs.values());
}

async function processJobQueue(handler) {
  while (jobQueue.length > 0) {
    const job = jobQueue.shift();
    try {
      job.start();
      const result = await handler(job);
      job.complete(result);
    } catch (error) {
      job.fail(error);
    }
  }
}

module.exports = {
  enqueueJob,
  getJob,
  listJobs,
  processJobQueue,
  Job
};
