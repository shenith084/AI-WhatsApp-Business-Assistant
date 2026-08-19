'use client';

import React, { useEffect, useState } from 'react';
import { getDashboardMetrics, getOrders, getTickets } from '@/app/actions';

// ── Types ──────────────────────────────────────────────────────────────────────
interface MetricCard { label: string; value: string; change: string; up: boolean; icon: React.ReactNode; color: string; gradient: string; }
interface RecentOrder { id: string; customer: string; items: string; total: string; status: string; time: string; }
interface RecentTicket { id: string; customer: string; reason: string; status: string; time: string; }
interface IntentData { intent: string; count: number; pct: number; }

// ── Icons ──────────────────────────────────────────────────────────────────────
const BoxIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const DollarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const MessageIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const TicketIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><line x1="13" y1="5" x2="13" y2="19"></line></svg>;

// ── Demo data (replace with Supabase queries in production) ──────────────────

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
  fulfilled:   'badge-purple',
  cancelled:   'badge-danger',
  open:        'badge-danger',
  in_progress: 'badge-warning',
  resolved:    'badge-success',
};

const INTENT_COLORS: string[] = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#64748b'];

export default function DashboardOverviewPage() {
  const [mounted, setMounted] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const [metricsData, ordersRes, ticketsRes] = await Promise.all([
        getDashboardMetrics(),
        getOrders(),
        getTickets()
      ]);
      setMetrics(metricsData);
      setOrders(ordersRes.data?.slice(0, 5) || []);
      setTickets(ticketsRes.data?.slice(0, 3) || []);
    }
    loadData();
  }, []);

  if (!mounted) return null;

  const dynamicMetrics: MetricCard[] = [
    { label: 'Total Orders',       value: metrics?.orders?.toString() || '0',   change: '+12% this week', up: true,  icon: <BoxIcon/>, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { label: 'Revenue (USD)',      value: `$${metrics?.revenue?.toLocaleString() || '0'}`, change: '+18% this week', up: true,  icon: <DollarIcon/>, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    { label: 'Messages Today',     value: metrics?.messagesToday?.toString() || '0',   change: '+5% vs yesterday',up: true,  icon: <MessageIcon/>, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { label: 'Open Tickets',       value: metrics?.openTickets?.toString() || '0',     change: 'Requires attention',up: false, icon: <TicketIcon/>, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  ];

  return (
    <>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
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
        {dynamicMetrics.map((m, i) => (
          <div key={i} style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '24px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
            border: '1px solid var(--color-border)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: m.gradient }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-muted)' }}>{m.label}</span>
              <div style={{ 
                width: '40px', height: '40px', 
                borderRadius: '10px', 
                background: `${m.color}15`, 
                color: m.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {m.icon}
              </div>
            </div>
            
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              {m.value}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: m.up ? '#059669' : '#dc2626' }}>
              <span style={{ background: m.up ? '#ecfdf5' : '#fef2f2', padding: '2px 6px', borderRadius: '6px' }}>
                {m.up ? '↑' : '↓'}
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Intent Distribution + Recent Activity ─────────────────────────── */}
      <div className="section-grid">

        {/* Intent bar chart */}
        <div className="card" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '24px' }}>
            <span className="card-title" style={{ fontSize: '16px', fontWeight: 700 }}>Intent Distribution</span>
            <span style={{ fontSize: '13px', fontWeight: 600, background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', color: 'var(--color-text-muted)' }}>237 messages</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {DEMO_INTENTS.map((d, i) => (
              <div key={d.intent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-main)', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {d.intent.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    <span style={{ color: INTENT_COLORS[i] }}>{d.count}</span> <span style={{ opacity: 0.6 }}>({d.pct}%)</span>
                  </span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${d.pct}%`,
                    background: INTENT_COLORS[i],
                    borderRadius: '4px',
                    transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open tickets quick view */}
        <div className="card" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '24px' }}>
            <span className="card-title" style={{ fontSize: '16px', fontWeight: 700 }}>Needs Attention</span>
            <a href="/dashboard/tickets">
              <button className="btn btn-secondary btn-sm" style={{ background: '#f8fafc' }}>View All</button>
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tickets.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px',
                background: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'border-color 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              onClick={() => window.location.href = '/dashboard/tickets'}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                      {t.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>• {t.customer_number}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                    {t.reason.replace('_', ' ')}
                  </span>
                </div>
                <span className={`badge ${STATUS_BADGE[t.status] ?? 'badge-muted'}`} style={{ padding: '6px 12px', fontSize: '12px' }}>{t.status.replace('_', ' ')}</span>
              </div>
            ))}
            {tickets.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>🎉</div>
                <div style={{ fontWeight: 600 }}>All caught up!</div>
                <div style={{ fontSize: '13px' }}>No open tickets right now.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Orders ──────────────────────────────────────────────────── */}
      <div className="card" style={{ marginTop: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
          <span className="card-title" style={{ fontSize: '16px', fontWeight: 700 }}>Recent Orders</span>
          <a href="/dashboard/orders">
            <button className="btn btn-secondary btn-sm" style={{ background: '#f8fafc' }} id="view-all-orders">View All</button>
          </a>
        </div>
        <div className="table-wrapper" style={{ margin: '0 -24px -24px -24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Order ID</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Items</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => {
                let itemsCount = 0;
                try { itemsCount = (typeof o.items === 'string' ? JSON.parse(o.items) : o.items)?.length || 0; } catch(e){}
                return (
                  <tr key={o.id} style={{ borderTop: '1px solid var(--color-border)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'} onClick={()=>window.location.href='/dashboard/orders'}>
                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>{o.id.substring(0, 8).toUpperCase()}</td>
                    <td style={{ padding: '16px 24px' }}>{o.customer_number}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>{itemsCount} item(s)</td>
                    <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--color-text-main)' }}>LKR {(o.total_price || 0).toLocaleString()}</td>
                    <td style={{ padding: '16px 24px' }}><span className={`badge ${STATUS_BADGE[o.status] ?? 'badge-muted'}`} style={{ textTransform: 'capitalize' }}>{o.status.replace('_', ' ')}</span></td>
                  </tr>
                );
              })}
              {orders.length === 0 && <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No recent orders.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
