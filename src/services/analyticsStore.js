const events = [];

function recordEvent(event) {
  events.push({
    ...event,
    timestamp: event.timestamp || new Date().toISOString()
  });
}

function getAnalytics({ tenantId } = {}) {
  const scoped = events.filter((event) => !tenantId || event.tenantId === tenantId);
  const countsByType = scoped.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEvents: scoped.length,
    countsByType,
    recentEvents: scoped.slice(-10)
  };
}

module.exports = {
  recordEvent,
  getAnalytics
};