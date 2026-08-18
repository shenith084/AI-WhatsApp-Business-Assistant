'use client';

import { useEffect, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface MetricCard { label: string; value: string; change: string; up: boolean; icon: string; color: string; }
interface RecentOrder { id: string; customer: string; items: string; total: string; status: string; time: string; }
interface RecentTicket { id: string; customer: string; reason: string; status: string; time: string; }
interface IntentData { intent: string; count: number; pct: number; }

// ── Demo data (replace with Supabase queries in production) ──────────────────
const DEMO_METRICS: MetricCard[] = [
  { label: 'Total Orders',       value: '148',   change: '+12% this week', up: true,  icon: '📦', color: 'rgba(37,211,102,0.1)' },
  { label: 'Revenue (USD)',      value: '$4,820', change: '+18% this week', up: true,  icon: '💰', color: 'rgba(59,130,246,0.1)' },
  { label: 'Messages Today',     value: '237',   change: '+5% vs yesterday',up: true,  icon: '💬', color: 'rgba(245,158,11,0.1)' },
  { label: 'Open Tickets',       value: '3',     change: '↓2 resolved today',up: true, icon: '🎫', color: 'rgba(239,68,68,0.1)' },
];

const DEMO_ORDERS: RecentOrder[] = [
  { id: 'ORD-001', customer: '+94771234567', items: 'Premium Cotton T-Shirt × 25', total: '$225', status: 'confirmed', time: '2 min ago' },
  { id: 'ORD-002', customer: '+94769876543', items: 'Slim-Fit Chinos × 12',         total: '$237', status: 'pending',   time: '14 min ago' },
  { id: 'ORD-003', customer: '+94755111222', items: 'Floral Midi Dress × 5',        total: '$140', status: 'fulfilled', time: '1 hr ago' },
  { id: 'ORD-004', customer: '+94712345678', items: 'Denim Jacket × 3',             total: '$108', status: 'pending',   time: '2 hr ago' },
  { id: 'ORD-005', customer: '+94778899001', items: 'Canvas Tote Bag × 50',         total: '$180', status: 'confirmed', time: '3 hr ago' },
];

const DEMO_TICKETS: RecentTicket[] = [
  { id: 'TKT-001', customer: '+94771234560', reason: 'complaint',        status: 'open',        time: '5 min ago' },
  { id: 'TKT-002', customer: '+94769876500', reason: 'customer_request', status: 'in_progress', time: '1 hr ago' },
  { id: 'TKT-003', customer: '+94712345600', reason: 'low_confidence',   status: 'open',        time: '2 hr ago' },
];

const DEMO_INTENTS: IntentData[] = [
  { intent: 'PRODUCT_INQUIRY', count: 89, pct: 38 },
  { intent: 'BULK_ORDER',       count: 52, pct: 22 },
  { intent: 'PRICE_CHECK',      count: 41, pct: 17 },
  { intent: 'OFFER_REQUEST',    count: 28, pct: 12 },
  { intent: 'COMPLAINT',        count: 15, pct: 6  },
  { intent: 'OTHER',            count: 12, pct: 5  },
];

const STATUS_BADGE: Record<string, string> = {
  confirmed:   'badge-success',
  pending:     'badge-warning',
  fulfilled:   'badge-info',
  cancelled:   'badge-danger',
  open:        'badge-danger',
  in_progress: 'badge-warning',
  resolved:    'badge-success',
};

const INTENT_COLORS: string[] = ['#25D366','#3b82f6','#f59e0b','#a78bfa','#ef4444','#8892a4'];

export default function DashboardOverviewPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      {/* ── Topbar ────────────────────────────────────────────────────────── */}
      <div className="topbar">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Fashion Gallery · AI WhatsApp Business Assistant · Live</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(37,211,102,0.08)',
            border: '1px solid rgba(37,211,102,0.2)',
            borderRadius: '10px', padding: '8px 14px', fontSize: '13px'
          }}>
            <span className="status-dot online" />
            <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Bot Active</span>
          </div>
          <button
            id="refresh-overview"
            className="btn btn-secondary btn-sm"
            onClick={() => window.location.reload()}
          >↻ Refresh</button>
        </div>
      </div>

      {/* ── Metric Cards ──────────────────────────────────────────────────── */}
      <div className="metrics-grid">
        {DEMO_METRICS.map((m, i) => (
          <div key={i} className="metric-card" style={{ '--metric-accent': m.color } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="metric-label">{m.label}</span>
              <div className="metric-icon" style={{ background: m.color }}>{m.icon}</div>
            </div>
            <div className="metric-value">{m.value}</div>
            <div className={`metric-change ${m.up ? 'up' : 'down'}`}>
              {m.up ? '▲' : '▼'} {m.change}
            </div>
          </div>
        ))}
      </div>

      {/* ── Intent Distribution + Recent Activity ─────────────────────────── */}
      <div className="section-grid">

        {/* Intent bar chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Intent Distribution Today</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>237 messages</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {DEMO_INTENTS.map((d, i) => (
              <div key={d.intent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    {d.intent}
                  </span>
                  <span style={{ fontSize: '12px', color: INTENT_COLORS[i], fontWeight: 700 }}>
                    {d.count} ({d.pct}%)
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${d.pct}%`,
                    background: INTENT_COLORS[i],
                    borderRadius: '3px',
                    transition: 'width 1s ease',
                    boxShadow: `0 0 8px ${INTENT_COLORS[i]}60`
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open tickets quick view */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Open Support Tickets</span>
            <a href="/dashboard/tickets">
              <button className="btn btn-secondary btn-sm" id="view-all-tickets">View All</button>
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {DEMO_TICKETS.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {t.id}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {t.customer} · {t.reason} · {t.time}
                  </span>
                </div>
                <span className={`badge ${STATUS_BADGE[t.status] ?? 'badge-muted'}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Orders ──────────────────────────────────────────────────── */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <span className="card-title">Recent Orders</span>
          <a href="/dashboard/orders">
            <button className="btn btn-secondary btn-sm" id="view-all-orders">View All Orders</button>
          </a>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ORDERS.map(o => (
                <tr key={o.id}>
                  <td className="strong" style={{ fontFamily: 'var(--font-mono)' }}>{o.id}</td>
                  <td>{o.customer}</td>
                  <td>{o.items}</td>
                  <td className="strong" style={{ color: 'var(--color-accent)' }}>{o.total}</td>
                  <td><span className={`badge ${STATUS_BADGE[o.status] ?? 'badge-muted'}`}>{o.status}</span></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
