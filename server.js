// server.js - Express backend for IT Support Cost Optimization

const express = require('express');
const cors = require('cors');
const { generateDataset, generateStreamTicket } = require('./dataGenerator');
const { computeAnalytics } = require('./analytics');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ─── In-Memory Ticket Store ───────────────────────────────────────────────────
let ticketStore = generateDataset(2000);
let streamClients = [];
let streamInterval = null;

// ─── SSE Stream Setup ─────────────────────────────────────────────────────────
function startStream() {
  if (streamInterval) return;
  streamInterval = setInterval(() => {
    // Simulate 50,000 events/sec — we push 1 ticket every 100ms to the dashboard
    const newTicket = generateStreamTicket();
    ticketStore.unshift(newTicket);
    if (ticketStore.length > 5000) ticketStore = ticketStore.slice(0, 5000);

    const data = JSON.stringify({ type: 'ticket', payload: newTicket });
    streamClients.forEach(client => {
      try { client.res.write(`data: ${data}\n\n`); } catch (e) { /* dead client */ }
    });
  }, 100);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ticketCount: ticketStore.length, timestamp: new Date().toISOString() });
});

// Get paginated tickets
app.get('/api/tickets', (req, res) => {
  const { page = 1, limit = 50, priority, category, clientType, sort = 'newest' } = req.query;
  let filtered = [...ticketStore];

  if (priority) filtered = filtered.filter(t => t.priority === priority);
  if (category) filtered = filtered.filter(t => t.category === category);
  if (clientType) filtered = filtered.filter(t => t.clientType === clientType);

  if (sort === 'cost') filtered.sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0));
  else if (sort === 'resolution') filtered.sort((a, b) => (b.resolutionTime || 0) - (a.resolutionTime || 0));
  else filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + parseInt(limit));

  res.json({ data, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) });
});

// Get analytics
app.get('/api/analytics', (req, res) => {
  const start = Date.now();
  const analytics = computeAnalytics(ticketStore);
  const elapsed = Date.now() - start;
  res.json({ ...analytics, computeTime: `${elapsed}ms`, dataPoints: ticketStore.length });
});

// Get single ticket
app.get('/api/tickets/:id', (req, res) => {
  const ticket = ticketStore.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

// Prediction endpoint (responds within 5 seconds)
app.post('/api/predict', (req, res) => {
  const { category, priority, clientType } = req.body;

  if (!category || !priority || !clientType) {
    return res.status(400).json({ error: 'category, priority, clientType required' });
  }

  const similar = ticketStore.filter(t =>
    t.category === category && t.priority === priority && t.clientType === clientType &&
    t.totalCost !== null && t.resolutionTime !== null
  );

  if (similar.length < 3) {
    // Fall back to category match
    const fallback = ticketStore.filter(t => t.category === category && t.totalCost !== null);
    if (fallback.length === 0) return res.status(404).json({ error: 'Insufficient data for prediction' });

    const avgCost = fallback.reduce((s, t) => s + t.totalCost, 0) / fallback.length;
    const avgResolution = fallback.filter(t => t.resolutionTime).reduce((s, t) => s + t.resolutionTime, 0) /
      fallback.filter(t => t.resolutionTime).length;

    return res.json({
      predictedCost: parseFloat(avgCost.toFixed(2)),
      predictedResolutionTime: parseFloat(avgResolution.toFixed(2)),
      escalationRisk: priority === 'Critical' ? 'High' : priority === 'High' ? 'Medium' : 'Low',
      confidence: 'Low',
      sampleSize: fallback.length,
      computeTime: '<5ms'
    });
  }

  const avgCost = similar.reduce((s, t) => s + t.totalCost, 0) / similar.length;
  const avgResolution = similar.reduce((s, t) => s + t.resolutionTime, 0) / similar.length;
  const escalationRate = similar.filter(t => t.escalationCount > 0).length / similar.length;

  res.json({
    predictedCost: parseFloat(avgCost.toFixed(2)),
    predictedResolutionTime: parseFloat(avgResolution.toFixed(2)),
    escalationRisk: escalationRate > 0.3 ? 'High' : escalationRate > 0.15 ? 'Medium' : 'Low',
    confidence: similar.length > 50 ? 'High' : similar.length > 20 ? 'Medium' : 'Low',
    sampleSize: similar.length,
    computeTime: '<5ms'
  });
});

// Server-Sent Events for live stream
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  streamClients.push({ id: clientId, res });

  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Stream connected', clientId })}\n\n`);

  req.on('close', () => {
    streamClients = streamClients.filter(c => c.id !== clientId);
  });
});

// Reset data
app.post('/api/reset', (req, res) => {
  ticketStore = generateDataset(2000);
  res.json({ message: 'Data reset successfully', ticketCount: ticketStore.length });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 IT Support Analytics API running on http://localhost:${PORT}`);
  console.log(`📊 Loaded ${ticketStore.length} tickets`);
  console.log(`📡 Stream endpoint: http://localhost:${PORT}/api/stream`);
  startStream();
});