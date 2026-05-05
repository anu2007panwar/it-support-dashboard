// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import api from './utils/Api';
import Dashboard from './components/Dashboard';
import TicketsTable from './components/TicketsTable';
import Predictor from './components/Predictor';
import Recommendations from './components/Recommendations';
import './App.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'tickets', label: 'Live Tickets', icon: '⬡' },
  { id: 'predict', label: 'Predictor', icon: '◎' },
  { id: 'recommendations', label: 'Actions', icon: '◆' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveCount, setLiveCount] = useState(0);
  const [streamStatus, setStreamStatus] = useState('connecting');
  const [lastTicket, setLastTicket] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await api.analytics();
      setAnalytics(data);
      setError(null);
    } catch (e) {
      setError('Cannot connect to backend. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  useEffect(() => {
    const es = new EventSource('http://localhost:5000/api/stream');
    es.onopen = () => setStreamStatus('live');
    es.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'ticket') {
        setLiveCount(c => c + 1);
        setLastTicket(msg.payload);
      }
    };
    es.onerror = () => setStreamStatus('disconnected');
    return () => es.close();
  }, []);

  const handleReset = async () => {
    await api.reset();
    setLiveCount(0);
    fetchAnalytics();
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">◈</div>
          <div>
            <div className="brand-title">SupportIQ</div>
            <div className="brand-sub">Cost Analytics</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className={`stream-badge ${streamStatus}`}>
            <span className="pulse-dot" />
            <span>{streamStatus === 'live' ? `Live · ${liveCount} new` : streamStatus}</span>
          </div>
          <button className="reset-btn" onClick={handleReset}>↺ Reset Data</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <p>Connecting to analytics engine…</p>
          </div>
        ) : error ? (
          <div className="error-screen">
            <div className="error-icon">⚠</div>
            <h2>Backend Not Running</h2>
            <p>{error}</p>
            <code>cd backend && npm install && npm start</code>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard analytics={analytics} lastTicket={lastTicket} />}
            {activeTab === 'tickets' && <TicketsTable liveCount={liveCount} />}
            {activeTab === 'predict' && <Predictor />}
            {activeTab === 'recommendations' && <Recommendations recommendations={analytics?.recommendations} summary={analytics?.summary} />}
          </>
        )}
      </main>
    </div>
  );
}