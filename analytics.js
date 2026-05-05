// analytics.js - Core analytics engine

function computeAnalytics(tickets) {
  const validTickets = tickets.filter(t => t.totalCost !== null);
  const totalTickets = tickets.length;

  // ─── Cost Analysis ───────────────────────────────────────────────────────────
  const totalCost = validTickets.reduce((s, t) => s + t.totalCost, 0);
  const avgCostPerTicket = totalCost / validTickets.length;

  const costByCategory = {};
  const costByPriority = {};
  const costByClient = {};

  for (const t of validTickets) {
    costByCategory[t.category] = (costByCategory[t.category] || 0) + t.totalCost;
    costByPriority[t.priority] = (costByPriority[t.priority] || 0) + t.totalCost;
    costByClient[t.clientType] = (costByClient[t.clientType] || 0) + t.totalCost;
  }

  // ─── Resolution Time Analysis ─────────────────────────────────────────────
  const validResolution = tickets.filter(t => t.resolutionTime !== null);
  const avgResolutionTime = validResolution.reduce((s, t) => s + t.resolutionTime, 0) / validResolution.length;

  const resolutionByCategory = {};
  for (const t of validResolution) {
    if (!resolutionByCategory[t.category]) resolutionByCategory[t.category] = [];
    resolutionByCategory[t.category].push(t.resolutionTime);
  }
  const avgResolutionByCategory = {};
  for (const [cat, times] of Object.entries(resolutionByCategory)) {
    avgResolutionByCategory[cat] = times.reduce((a, b) => a + b, 0) / times.length;
  }

  // ─── Satisfaction Analysis ───────────────────────────────────────────────
  const validSat = tickets.filter(t => t.satisfactionScore !== null);
  const avgSatisfaction = validSat.reduce((s, t) => s + t.satisfactionScore, 0) / validSat.length;

  const satByPriority = {};
  for (const t of validSat) {
    if (!satByPriority[t.priority]) satByPriority[t.priority] = [];
    satByPriority[t.priority].push(t.satisfactionScore);
  }
  const avgSatByPriority = {};
  for (const [p, scores] of Object.entries(satByPriority)) {
    avgSatByPriority[p] = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // ─── Escalation Analysis ──────────────────────────────────────────────────
  const escalated = tickets.filter(t => t.escalationCount > 0);
  const escalationRate = escalated.length / totalTickets;
  const avgEscalationCost = escalated.reduce((s, t) => s + (t.totalCost || 0), 0) / Math.max(escalated.length, 1);

  const escalationByCategory = {};
  for (const t of tickets) {
    if (!escalationByCategory[t.category]) escalationByCategory[t.category] = { count: 0, total: 0 };
    escalationByCategory[t.category].total++;
    if (t.escalationCount > 0) escalationByCategory[t.category].count++;
  }
  const escalationRateByCategory = {};
  for (const [cat, d] of Object.entries(escalationByCategory)) {
    escalationRateByCategory[cat] = (d.count / d.total) * 100;
  }

  // ─── Engineer Utilization ─────────────────────────────────────────────────
  const engineerMap = {};
  for (const t of validTickets) {
    if (!engineerMap[t.engineerId]) engineerMap[t.engineerId] = { tickets: 0, cost: 0, resolution: [] };
    engineerMap[t.engineerId].tickets++;
    engineerMap[t.engineerId].cost += t.totalCost;
    if (t.resolutionTime) engineerMap[t.engineerId].resolution.push(t.resolutionTime);
  }
  const engineerStats = Object.entries(engineerMap).map(([id, d]) => ({
    engineerId: id,
    ticketCount: d.tickets,
    totalCost: d.cost,
    avgResolutionTime: d.resolution.length ? d.resolution.reduce((a, b) => a + b, 0) / d.resolution.length : 0
  })).sort((a, b) => b.ticketCount - a.ticketCount);

  // ─── Trend Analysis (last 30 days bucketed by day) ────────────────────────
  const now = new Date();
  const dailyBuckets = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailyBuckets[key] = { date: key, tickets: 0, cost: 0, escalations: 0 };
  }
  for (const t of tickets) {
    const key = t.timestamp.split('T')[0];
    if (dailyBuckets[key]) {
      dailyBuckets[key].tickets++;
      if (t.totalCost) dailyBuckets[key].cost += t.totalCost;
      if (t.escalationCount > 0) dailyBuckets[key].escalations++;
    }
  }
  const dailyTrend = Object.values(dailyBuckets);

  // ─── Missing Data Stats ───────────────────────────────────────────────────
  const missingCost = tickets.filter(t => t.totalCost === null).length;
  const missingSat = tickets.filter(t => t.satisfactionScore === null).length;

  // ─── Actionable Recommendations ───────────────────────────────────────────
  const recommendations = generateRecommendations({
    totalCost, avgSatisfaction, escalationRate, avgResolutionTime,
    costByCategory, escalationRateByCategory, avgResolutionByCategory,
    engineerStats, totalTickets
  });

  // ─── KPI Summary ─────────────────────────────────────────────────────────
  const projectedAnnualCost = (totalCost / validTickets.length) * 2000000;
  const potentialSavings = projectedAnnualCost * 0.20;

  return {
    summary: {
      totalTickets,
      totalCost: parseFloat(totalCost.toFixed(2)),
      avgCostPerTicket: parseFloat(avgCostPerTicket.toFixed(2)),
      avgResolutionTime: parseFloat(avgResolutionTime.toFixed(2)),
      avgSatisfaction: parseFloat(avgSatisfaction.toFixed(2)),
      escalationRate: parseFloat((escalationRate * 100).toFixed(2)),
      projectedAnnualCost: parseFloat(projectedAnnualCost.toFixed(0)),
      potentialSavings: parseFloat(potentialSavings.toFixed(0)),
      missingDataPercent: parseFloat(((missingCost + missingSat) / (totalTickets * 2) * 100).toFixed(1)),
      satisfactionTarget: 4.2,
      satisfactionMet: avgSatisfaction >= 4.2
    },
    costByCategory: Object.entries(costByCategory)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value),
    costByPriority: Object.entries(costByPriority)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) })),
    costByClient: Object.entries(costByClient)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) })),
    avgResolutionByCategory: Object.entries(avgResolutionByCategory)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value),
    avgSatByPriority: Object.entries(avgSatByPriority)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) })),
    escalationRateByCategory: Object.entries(escalationRateByCategory)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }))
      .sort((a, b) => b.value - a.value),
    engineerStats: engineerStats.slice(0, 20),
    dailyTrend,
    recommendations
  };
}

function generateRecommendations({ totalCost, avgSatisfaction, escalationRate,
  avgResolutionTime, costByCategory, escalationRateByCategory, avgResolutionByCategory,
  engineerStats, totalTickets }) {

  const recs = [];

  // Top cost category
  const topCostCat = Object.entries(costByCategory).sort((a, b) => b[1] - a[1])[0];
  if (topCostCat) {
    recs.push({
      id: 'REC-001',
      priority: 'Critical',
      category: 'Cost Reduction',
      title: `Optimize ${topCostCat[0]} Resolution Process`,
      description: `"${topCostCat[0]}" is your highest cost category at $${topCostCat[1].toFixed(0)}. Implement specialized runbooks and automation to cut resolution time by 30%.`,
      estimatedSaving: parseFloat((topCostCat[1] * 0.30).toFixed(0)),
      effort: 'Medium',
      timeframe: '3 months'
    });
  }

  // Escalation reduction
  if (escalationRate > 0.10) {
    const topEsc = Object.entries(escalationRateByCategory).sort((a, b) => b[1] - a[1])[0];
    recs.push({
      id: 'REC-002',
      priority: 'High',
      category: 'Escalation Management',
      title: 'Implement Proactive Escalation Prevention',
      description: `Escalation rate is ${(escalationRate * 100).toFixed(1)}%. "${topEsc?.[0]}" has the highest rate at ${topEsc?.[1].toFixed(1)}%. Train L1 engineers with guided decision trees.`,
      estimatedSaving: parseFloat((totalCost * escalationRate * 0.40).toFixed(0)),
      effort: 'High',
      timeframe: '2 months'
    });
  }

  // Satisfaction improvement
  if (avgSatisfaction < 4.2) {
    recs.push({
      id: 'REC-003',
      priority: 'High',
      category: 'Customer Satisfaction',
      title: 'Deploy Real-Time Satisfaction Monitoring',
      description: `Current satisfaction is ${avgSatisfaction.toFixed(2)}, below the 4.2 target. Implement mid-resolution check-ins and SLA breach alerts to proactively engage clients.`,
      estimatedSaving: null,
      satisfactionGain: parseFloat((4.2 - avgSatisfaction + 0.1).toFixed(2)),
      effort: 'Low',
      timeframe: '1 month'
    });
  }

  // Resolution time
  const slowestCat = Object.entries(avgResolutionByCategory).sort((a, b) => b[1] - a[1])[0];
  if (slowestCat && slowestCat[1] > 4) {
    recs.push({
      id: 'REC-004',
      priority: 'Medium',
      category: 'Engineer Optimization',
      title: `Reduce "${slowestCat[0]}" Resolution Time`,
      description: `Average resolution time for "${slowestCat[0]}" is ${slowestCat[1].toFixed(1)}h. Assign dedicated specialist teams and create reusable solution templates.`,
      estimatedSaving: parseFloat((totalCost * 0.07).toFixed(0)),
      effort: 'Medium',
      timeframe: '2 months'
    });
  }

  // Engineer workload balancing
  const maxTickets = engineerStats[0]?.ticketCount || 0;
  const minTickets = engineerStats[engineerStats.length - 1]?.ticketCount || 0;
  if (maxTickets > minTickets * 2) {
    recs.push({
      id: 'REC-005',
      priority: 'Medium',
      category: 'Resource Allocation',
      title: 'Rebalance Engineer Workload Distribution',
      description: `Top engineer handles ${maxTickets} tickets vs ${minTickets} for lowest. Implement intelligent ticket routing based on skills, availability, and historic performance.`,
      estimatedSaving: parseFloat((totalCost * 0.08).toFixed(0)),
      effort: 'Low',
      timeframe: '1 month'
    });
  }

  // Missing data
  recs.push({
    id: 'REC-006',
    priority: 'Low',
    category: 'Data Quality',
    title: 'Enforce Mandatory Data Completion Policy',
    description: 'Up to 20% of tickets have missing resolution time or satisfaction scores, reducing analytics accuracy. Implement form validation and engineer accountability scoring.',
    estimatedSaving: null,
    effort: 'Low',
    timeframe: '2 weeks'
  });

  return recs;
}

module.exports = { computeAnalytics };