// src/components/TicketsTable.js
import React, { useState, useEffect } from 'react';
import api from '../utils/Api';

const PRIORITIES = ['', 'Critical', 'High', 'Medium', 'Low'];
const CATEGORIES = ['', 'Network Outage', 'Software Bug', 'Hardware Failure', 'Security Breach', 'Access Request', 'Email Issue', 'VPN Problem', 'Database Error', 'Performance Issue', 'Printer Problem', 'Mobile Device', 'Cloud Service'];
const CLIENTS = ['', 'Small', 'Medium', 'Enterprise'];

function PriorityBadge({ p }) {
  const cls = { Critical: 'badge badge-critical', High: 'badge badge-high', Medium: 'badge badge-medium', Low: 'badge badge-low' };
  return <span className={cls[p] || 'badge'}>{p}</span>;
}

function ClientBadge({ c }) {
  const cls = { Enterprise: 'badge badge-enterprise', Medium: 'badge badge-medium-client', Small: 'badge badge-small' };
  return <span className={cls[c] || 'badge'}>{c}</span>;
}

export default function TicketsTable({ liveCount }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [clientType, setClientType] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.tickets({ page, limit: 50, priority, category, clientType, sort });
      setData(res.data);
      setTotal(res.total);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { setPage(1); }, [priority, category, clientType, sort]);
  useEffect(() => { fetchTickets(); }, [page, priority, category, clientType, sort]);

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="table-container">
      <div className="page-header" style={{ paddingLeft: 0, paddingRight: 0, marginBottom: 20 }}>
        <div>
          <div className="page-title">Live Tickets</div>
          <div className="page-subtitle">{total.toLocaleString()} total · {liveCount} new since load</div>
        </div>
        <div className="header-badge" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', borderColor: 'rgba(0,255,136,0.2)' }}>
          ● Streaming 50k events/sec
        </div>
      </div>

      <div className="table-controls">
        <select className="filter-select" value={priority} onChange={e => setPriority(e.target.value)}>
          {PRIORITIES.map(p => <option key={p} value={p}>{p || 'All Priorities'}</option>)}
        </select>
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
        <select className="filter-select" value={clientType} onChange={e => setClientType(e.target.value)}>
          {CLIENTS.map(c => <option key={c} value={c}>{c || 'All Clients'}</option>)}
        </select>
        <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="cost">Highest Cost</option>
          <option value="resolution">Longest Resolution</option>
        </select>
      </div>

      <div className="tickets-table-wrap">
        {loading && <div style={{ textAlign: 'center', padding: 20, color: '#8da4be', fontSize: 13 }}>Loading…</div>}
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Client</th>
              <th>Resolution (h)</th>
              <th>Cost/Hr</th>
              <th>Total Cost</th>
              <th>Escalations</th>
              <th>Satisfaction</th>
              <th>Engineer</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map(t => (
              <tr key={t.id}>
                <td className="primary" style={{ fontFamily: 'Space Mono,monospace', fontSize: 11 }}>{t.id.slice(0, 8)}…</td>
                <td>{t.category}</td>
                <td><PriorityBadge p={t.priority} /></td>
                <td><ClientBadge c={t.clientType} /></td>
                <td style={{ color: t.resolutionTime === null ? '#4a6080' : t.resolutionTime > 5 ? '#ff4757' : '#e8f0fe' }}>
                  {t.resolutionTime ?? '—'}
                </td>
                <td>${t.costPerHour.toFixed(0)}</td>
                <td style={{ color: t.totalCost === null ? '#4a6080' : '#00ff88', fontFamily: 'Space Mono,monospace' }}>
                  {t.totalCost ? `$${t.totalCost.toFixed(0)}` : '—'}
                </td>
                <td style={{ color: t.escalationCount > 0 ? '#ff4757' : '#8da4be' }}>{t.escalationCount}</td>
                <td style={{ color: t.satisfactionScore === null ? '#4a6080' : t.satisfactionScore >= 4.2 ? '#00ff88' : t.satisfactionScore >= 3.5 ? '#ffa502' : '#ff4757' }}>
                  {t.satisfactionScore ?? '—'}
                </td>
                <td style={{ fontFamily: 'Space Mono,monospace', fontSize: 11 }}>{t.engineerId}</td>
                <td style={{ fontSize: 11 }}>{new Date(t.timestamp).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
            return (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            );
          })}
          <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
          <span style={{ fontSize: 12, color: '#4a6080', marginLeft: 8 }}>{total.toLocaleString()} records</span>
        </div>
      )}
    </div>
  );
}