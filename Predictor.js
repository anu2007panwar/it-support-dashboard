// src/components/Predictor.js
import React, { useState } from 'react';
import api from '../utils/Api';

const CATEGORIES = ['Network Outage', 'Software Bug', 'Hardware Failure', 'Security Breach', 'Access Request', 'Email Issue', 'VPN Problem', 'Database Error', 'Performance Issue', 'Printer Problem', 'Mobile Device', 'Cloud Service'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const CLIENTS = ['Small', 'Medium', 'Enterprise'];

const RISK_COLOR = { High: '#ff4757', Medium: '#ffa502', Low: '#00ff88' };

export default function Predictor() {
  const [form, setForm] = useState({ category: 'Software Bug', priority: 'High', clientType: 'Enterprise' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.predict(form);
      setResult(data);
    } catch (e) {
      setError('Prediction failed. Make sure the backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="predictor-container">
      <div className="page-header" style={{ paddingLeft: 0, paddingRight: 0, marginBottom: 24 }}>
        <div>
          <div className="page-title">Cost Predictor</div>
          <div className="page-subtitle">Predict ticket cost & escalation risk before assignment — responds within 5 seconds</div>
        </div>
        <div className="header-badge">ML-Free · Stats-Based</div>
      </div>

      <div style={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Issue Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Client Type</label>
            <select className="form-select" value={form.clientType} onChange={e => setForm({ ...form, clientType: e.target.value })}>
              {CLIENTS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button className="predict-btn" onClick={predict} disabled={loading}>
          {loading ? 'Computing…' : '◎ Run Prediction'}
        </button>

        {error && <div style={{ color: '#ff4757', marginTop: 16, fontSize: 13 }}>{error}</div>}
      </div>

      {result && (
        <div>
          <div className="prediction-result">
            <div className="pred-metric">
              <div className="pred-value">${result.predictedCost.toFixed(0)}</div>
              <div className="pred-label">Predicted Cost</div>
              <div className="pred-confidence">Based on {result.sampleSize} similar tickets</div>
            </div>
            <div className="pred-metric">
              <div className="pred-value">{result.predictedResolutionTime.toFixed(1)}h</div>
              <div className="pred-label">Resolution Time</div>
              <div className="pred-confidence">Avg for this category</div>
            </div>
            <div className="pred-metric">
              <div className="pred-value" style={{ color: RISK_COLOR[result.escalationRisk] }}>{result.escalationRisk}</div>
              <div className="pred-label">Escalation Risk</div>
              <div className="pred-confidence">Confidence: {result.confidence}</div>
            </div>
          </div>

          <div style={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8, padding: 20, marginTop: 16, fontSize: 13, color: '#8da4be' }}>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#4a6080', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Prediction Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Category', form.category],
                ['Priority', form.priority],
                ['Client Type', form.clientType],
                ['Sample Size', result.sampleSize + ' tickets'],
                ['Confidence', result.confidence],
                ['Compute Time', result.computeTime],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e2d3d', paddingBottom: 8 }}>
                  <span>{k}</span>
                  <span style={{ color: '#e8f0fe', fontFamily: 'Space Mono,monospace', fontSize: 12 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 16, marginTop: 16, fontSize: 13, color: '#8da4be', lineHeight: 1.7 }}>
            <strong style={{ color: '#00d4ff', display: 'block', marginBottom: 6 }}>Recommendation</strong>
            {result.escalationRisk === 'High'
              ? `Assign a senior engineer immediately. ${form.category} at ${form.priority} priority for ${form.clientType} clients has a high escalation risk. Consider proactive client communication within the first hour.`
              : result.escalationRisk === 'Medium'
              ? `Assign a mid-level engineer with escalation path defined. Monitor resolution progress at the 50% time mark.`
              : `Standard assignment suitable. Use this ticket to train junior engineers. Low escalation risk for this combination.`}
          </div>
        </div>
      )}

      {!result && !loading && (
        <div style={{ background: '#0d1117', border: '1px dashed #1e2d3d', borderRadius: 8, padding: 40, textAlign: 'center', color: '#4a6080' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
          <div>Configure the ticket parameters above and run a prediction</div>
          <div style={{ fontSize: 12, marginTop: 8 }}>Results compute in under 5 seconds from 2M ticket history</div>
        </div>
      )}
    </div>
  );
}