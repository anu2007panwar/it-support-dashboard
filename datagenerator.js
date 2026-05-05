// dataGenerator.js - Generates realistic IT support ticket data

const { v4: uuidv4 } = require('uuid');

const ISSUE_CATEGORIES = [
  'Network Outage', 'Software Bug', 'Hardware Failure', 'Security Breach',
  'Access Request', 'Email Issue', 'VPN Problem', 'Database Error',
  'Performance Issue', 'Printer Problem', 'Mobile Device', 'Cloud Service'
];

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const CLIENT_TYPES = ['Small', 'Medium', 'Enterprise'];

const PRIORITY_WEIGHTS = {
  Critical: 0.10, High: 0.25, Medium: 0.40, Low: 0.25
};

const BASE_RESOLUTION_TIMES = {
  'Network Outage': { mean: 4.5, std: 2.0 },
  'Software Bug': { mean: 3.2, std: 1.5 },
  'Hardware Failure': { mean: 5.8, std: 2.5 },
  'Security Breach': { mean: 6.2, std: 2.8 },
  'Access Request': { mean: 0.8, std: 0.3 },
  'Email Issue': { mean: 1.2, std: 0.5 },
  'VPN Problem': { mean: 1.5, std: 0.7 },
  'Database Error': { mean: 4.0, std: 1.8 },
  'Performance Issue': { mean: 2.8, std: 1.2 },
  'Printer Problem': { mean: 0.9, std: 0.4 },
  'Mobile Device': { mean: 1.1, std: 0.5 },
  'Cloud Service': { mean: 3.5, std: 1.6 }
};

const ENGINEER_COSTS = {
  Small: { min: 45, max: 75 },
  Medium: { min: 65, max: 95 },
  Enterprise: { min: 85, max: 130 }
};

function gaussianRandom(mean, std) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.abs(mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v));
}

function weightedRandom(weights) {
  const keys = Object.keys(weights);
  const vals = Object.values(weights);
  const cumulative = [];
  let sum = 0;
  for (const v of vals) { sum += v; cumulative.push(sum); }
  const r = Math.random() * sum;
  for (let i = 0; i < cumulative.length; i++) {
    if (r <= cumulative[i]) return keys[i];
  }
  return keys[keys.length - 1];
}

function generateTicket(dateOffset = 0) {
  const category = ISSUE_CATEGORIES[Math.floor(Math.random() * ISSUE_CATEGORIES.length)];
  const priority = weightedRandom(PRIORITY_WEIGHTS);
  const clientType = CLIENT_TYPES[Math.floor(Math.random() * CLIENT_TYPES.length)];

  const resolutionConfig = BASE_RESOLUTION_TIMES[category];
  let resolutionTime = gaussianRandom(resolutionConfig.mean, resolutionConfig.std);

  // Priority multipliers
  const priorityMultipliers = { Critical: 0.7, High: 0.85, Medium: 1.0, Low: 1.3 };
  resolutionTime *= priorityMultipliers[priority];
  resolutionTime = Math.max(0.25, resolutionTime);

  const costConfig = ENGINEER_COSTS[clientType];
  const costPerHour = costConfig.min + Math.random() * (costConfig.max - costConfig.min);
  const totalCost = resolutionTime * costPerHour;

  // Escalation probability
  const escalationProb = { Critical: 0.35, High: 0.20, Medium: 0.08, Low: 0.03 };
  const escalationCount = Math.random() < escalationProb[priority]
    ? Math.floor(Math.random() * 3) + 1 : 0;

  const satisfactionBase = { Critical: 3.2, High: 3.8, Medium: 4.1, Low: 4.4 };
  const satisfaction = Math.min(5, Math.max(1,
    satisfactionBase[priority] + (Math.random() - 0.5) * 1.2 - escalationCount * 0.3
  ));

  // Randomly introduce missing data (up to 20%)
  const missingFields = {};
  if (Math.random() < 0.20) missingFields.resolutionTime = true;
  if (Math.random() < 0.20) missingFields.satisfaction = true;

  const now = new Date();
  const ticketDate = new Date(now.getTime() - dateOffset * 24 * 60 * 60 * 1000);

  return {
    id: uuidv4(),
    timestamp: ticketDate.toISOString(),
    category,
    priority,
    clientType,
    resolutionTime: missingFields.resolutionTime ? null : parseFloat(resolutionTime.toFixed(2)),
    costPerHour: parseFloat(costPerHour.toFixed(2)),
    totalCost: missingFields.resolutionTime ? null : parseFloat(totalCost.toFixed(2)),
    escalationCount,
    satisfactionScore: missingFields.satisfaction ? null : parseFloat(satisfaction.toFixed(1)),
    engineerId: `ENG-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
    resolved: Math.random() > 0.05
  };
}

function generateDataset(count = 1000) {
  const tickets = [];
  for (let i = 0; i < count; i++) {
    const dateOffset = Math.floor(Math.random() * 365);
    tickets.push(generateTicket(dateOffset));
  }
  return tickets.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function generateStreamTicket() {
  return generateTicket(0);
}

module.exports = { generateDataset, generateStreamTicket };