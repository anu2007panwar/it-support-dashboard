// src/components/Recommendations.js
import React from 'react';

const EFFORT_COLOR = { Low: '#00ff88', Medium: '#ffa502', High: '#ff4757' };

export default function Recommendations({ recommendations, summary }) {
  if (!recommendations) return null;

  const totalSavings = recommendations.reduce((s, r) => s + (r.estimatedSaving || 0), 0);

  return (
    <div className="recommendations-container">
      <div className="page-header" style={{ paddingLeft: 0, paddingRight: 0, marginBottom: 8 }}>
        <div>
          <div className="page-title">Action Recommendations</div>
          <div className="page-subtitle">AI-generated from ticket data analysis · {recommendations.length} actions identified</div>
        </div>
        <div className="header-badge" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', borderColor: 'rgba(0,255,136,0.2)' }}>
          Est. Savings: ${(totalSavings / 1000).toFixed(0)}K
        </div>
      </div>

      {/* Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Satisfaction', value: summary?.avgSatisfaction?.toFixed(2), target: '4.2', met: summary?.satisfactionMet },
          { label: 'Escalation Rate', value: `${summary?.escalationRate}%`, target: '<10%', met: summary?.escalationRate < 10 },
          { label: 'Avg Cost/Ticket', value: `$${summary?.avgCostPerTicket?.toFixed(0)}`, target: 'Reduce 20%', met: false },
          { label: 'Actions Needed', value: recommendations.length, target: 'Resolve all', met: false },
        ].map(item => (
          <div key={item.label} style={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#4a6080', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 22, color: item.met ? '#00ff88' : '#e8f0fe', fontWeight: 700 }}>{item.value}</div>
            <div style={{ fontSize: 11, color: item.met ? '#00ff88' : '#ffa502', marginTop: 4 }}>Target: {item.target}</div>
          </div>
        ))}
      </div>

      <div className="rec-grid">
        {recommendations.map(rec => (
          <div key={rec.id} className="rec-card">
            <div>
              <div className={`rec-priority-badge ${rec.priority}`}>{rec.priority}</div>
            </div>
            <div>
              <div className="rec-id">{rec.id} · {rec.category}</div>
              <div className="rec-title">{rec.title}</div>
              <div className="rec-desc">{rec.description}</div>
              <div className="rec-meta">
                <div className="rec-meta-item">Effort: <span style={{ color: EFFORT_COLOR[rec.effort] }}>{rec.effort}</span></div>
                <div className="rec-meta-item">Timeframe: <span>{rec.timeframe}</span></div>
                {rec.satisfactionGain && <div className="rec-meta-item">Satisfaction gain: <span style={{ color: '#00ff88' }}>+{rec.satisfactionGain}</span></div>}
              </div>
            </div>
            <div className="rec-saving">
              {rec.estimatedSaving ? (
                <>
                  <div className="saving-amount">${(rec.estimatedSaving / 1000).toFixed(0)}K</div>
                  <div className="saving-label">Est. Saving</div>
                </>
              ) : (
                <>
                  <div style={{ color: '#00d4ff', fontFamily: 'Space Mono,monospace', fontSize: 18, fontWeight: 700 }}>Quality</div>
                  <div className="saving-label">Improvement</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
