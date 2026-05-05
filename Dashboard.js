// src/components/Dashboard.js
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';

const COLORS = ['#00d4ff', '#00ff88', '#ffa502', '#ff4757', '#7c3aed', '#ff6b6b', '#a78bfa', '#34d399', '#fb923c', '#60a5fa', '#f472b6', '#4ade80'];

const fmt = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n?.toFixed(0)}`;

export default function Dashboard({ analytics, lastTicket }) {
  if (!analytics) return null;
  const { summary, costByCategory, costByPriority, avgResolutionByCategory, escalationRateByCategory, dailyTrend, avgSatByPriority } = analytics;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Analytics Overview</div>
          <div className="page-subtitle">{summary.totalTickets.toLocaleString()} tickets analyzed · Annual projection: {fmt(summary.projectedAnnualCost)}</div>
        </div>
        <div className="header-badge">Target: 20% Cost Reduction</div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Cost (Sample)</div>
          <div className="kpi-value accent">{fmt(summary.totalCost)}</div>
          <div className="kpi-meta">Annual projection: {fmt(summary.projectedAnnualCost)}</div>
        </div>
        <div className={`kpi-card ${summary.avgSatisfaction >= 4.2 ? 'success' : 'danger'}`}>
          <div className="kpi-label">Avg Satisfaction</div>
          <div className={`kpi-value ${summary.avgSatisfaction >= 4.2 ? 'green' : 'red'}`}>{summary.avgSatisfaction.toFixed(2)}</div>
          <div className="kpi-meta">Target: 4.2 · {summary.avgSatisfaction >= 4.2 ? '✓ Met' : '✗ Below target'}</div>
        </div>
        <div className={`kpi-card ${summary.escalationRate > 15 ? 'danger' : summary.escalationRate > 10 ? 'warning' : ''}`}>
          <div className="kpi-label">Escalation Rate</div>
          <div className={`kpi-value ${summary.escalationRate > 15 ? 'red' : summary.escalationRate > 10 ? 'amber' : 'green'}`}>{summary.escalationRate}%</div>
          <div className="kpi-meta">Target: below 10%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Resolution Time</div>
          <div className="kpi-value accent">{summary.avgResolutionTime}h</div>
          <div className="kpi-meta">Per ticket average</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-label">Potential Savings (20%)</div>
          <div className="kpi-value green">{fmt(summary.potentialSavings)}</div>
          <div className="kpi-meta">Annual if target achieved</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Cost / Ticket</div>
          <div className="kpi-value">${summary.avgCostPerTicket.toFixed(0)}</div>
          <div className="kpi-meta">Missing data: {summary.missingDataPercent}%</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        <div className="chart-panel">
          <div className="chart-title">Cost by Issue Category</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costByCategory.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => [`$${v.toFixed(0)}`, 'Cost']} contentStyle={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {costByCategory.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <div className="chart-title">Cost by Priority</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={costByPriority} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {costByPriority.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={v => [`$${v.toFixed(0)}`, 'Cost']} contentStyle={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        <div className="chart-panel">
          <div className="chart-title">Daily Ticket Volume & Cost (30 Days)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyTrend} margin={{ left: 0, right: 10 }}>
              <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fontSize: 9 }} interval={4} />
              <YAxis yAxisId="tickets" orientation="left" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="cost" orientation="right" tickFormatter={v => `$${v.toFixed(0)}`} tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8, fontSize: 11 }} />
              <Area yAxisId="tickets" type="monotone" dataKey="tickets" stroke="#00d4ff" fill="rgba(0,212,255,0.1)" strokeWidth={2} name="Tickets" />
              <Area yAxisId="cost" type="monotone" dataKey="cost" stroke="#00ff88" fill="rgba(0,255,136,0.08)" strokeWidth={2} name="Cost" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <div className="chart-title">Escalation Rate by Category (%)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={escalationRateByCategory.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" unit="%" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => [`${v.toFixed(1)}%`, 'Escalation Rate']} contentStyle={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {escalationRateByCategory.slice(0, 8).map((e, i) => (
                  <Cell key={i} fill={e.value > 25 ? '#ff4757' : e.value > 15 ? '#ffa502' : '#00ff88'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="charts-grid three" style={{ paddingBottom: 32 }}>
        <div className="chart-panel">
          <div className="chart-title">Avg Resolution Time by Category</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={avgResolutionByCategory.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" unit="h" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => [`${v.toFixed(1)}h`, 'Avg Time']} contentStyle={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <div className="chart-title">Satisfaction Score by Priority</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={avgSatByPriority}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => [v.toFixed(2), 'Satisfaction']} contentStyle={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {avgSatByPriority.map((e, i) => (
                  <Cell key={i} fill={e.value >= 4.2 ? '#00ff88' : e.value >= 3.5 ? '#ffa502' : '#ff4757'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <div className="chart-title">Live Ticket Feed</div>
          {lastTicket ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              {[
                ['ID', lastTicket.id?.slice(0, 12) + '...'],
                ['Category', lastTicket.category],
                ['Priority', lastTicket.priority],
                ['Client', lastTicket.clientType],
                ['Cost', lastTicket.totalCost ? `$${lastTicket.totalCost.toFixed(2)}` : 'N/A'],
                ['Resolution', lastTicket.resolutionTime ? `${lastTicket.resolutionTime}h` : 'N/A'],
                ['Escalations', lastTicket.escalationCount],
                ['Satisfaction', lastTicket.satisfactionScore ?? 'N/A'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e2d3d', paddingBottom: 8 }}>
                  <span style={{ color: '#8da4be' }}>{k}</span>
                  <span style={{ color: '#e8f0fe', fontFamily: 'Space Mono, monospace', fontSize: 12 }}>{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#4a6080', textAlign: 'center', marginTop: 60, fontSize: 14 }}>Waiting for live data…</div>
          )}
        </div>
      </div>
    </div>
  );
}