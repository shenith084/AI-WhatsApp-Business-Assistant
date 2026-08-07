'use client';

import { useState } from 'react';

const DEMO_ORDERS = [
  { id: 'ORD-001', customer: '+94771234567', items: [{ name:'Premium Cotton T-Shirt', qty:25, unit_price:10 }], total: 225, discount: 25, status:'confirmed', created_at:'2026-08-05T06:01:00Z' },
  { id: 'ORD-002', customer: '+94769876543', items: [{ name:'Slim-Fit Chinos', qty:12, unit_price:22 }],         total: 237, discount:27,  status:'pending',   created_at:'2026-08-05T05:47:00Z' },
  { id: 'ORD-003', customer: '+94755111222', items: [{ name:'Floral Midi Dress', qty:5, unit_price:35 }],        total: 140, discount:35,  status:'fulfilled', created_at:'2026-08-05T05:02:00Z' },
  { id: 'ORD-004', customer: '+94712345678', items: [{ name:'Denim Jacket', qty:3, unit_price:45 }],             total: 108, discount:27,  status:'pending',   created_at:'2026-08-05T04:18:00Z' },
  { id: 'ORD-005', customer: '+94778899001', items: [{ name:'Canvas Tote Bag', qty:50, unit_price:5 }],          total: 180, discount:120, status:'confirmed', created_at:'2026-08-05T03:55:00Z' },
  { id: 'ORD-006', customer: '+94779911002', items: [{ name:'Bomber Jacket', qty:10, unit_price:55 }],           total: 522, discount:28,  status:'confirmed', created_at:'2026-08-04T20:30:00Z' },
  { id: 'ORD-007', customer: '+94771122334', items: [{ name:'Polo T-Shirt', qty:40, unit_price:15 }],            total: 540, discount:60,  status:'fulfilled', created_at:'2026-08-04T18:00:00Z' },
];

const STATUS_BADGE: Record<string, string> = {
  confirmed:'badge-success', pending:'badge-warning', fulfilled:'badge-info', cancelled:'badge-danger'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof DEMO_ORDERS[0] | null>(null);

  const filtered = orders.filter(o =>
    (filterStatus === 'all' || o.status === filterStatus) &&
    (o.customer.includes(search) || o.id.toLowerCase().includes(search.toLowerCase()))
  );

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s,o) => s + o.total, 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total · ${totalRevenue.toFixed(0)} revenue · {pendingCount} pending</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button id="export-orders" className="btn btn-secondary btn-sm">⬇ Export CSV</button>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {[
          { label:'Total Orders',    value: orders.length,                         color:'var(--color-accent)' },
          { label:'Revenue (USD)',   value:`$${totalRevenue.toFixed(0)}`,           color:'var(--color-info)' },
          { label:'Pending',         value: pendingCount,                           color:'var(--color-warning)' },
          { label:'Confirmed',       value: confirmedCount,                         color:'var(--color-success)' },
        ].map((s,i) => (
          <div key={i} className="card" style={{ padding:'16px 20px' }}>
            <div style={{ fontSize:'11px', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>{s.label}</div>
            <div style={{ fontSize:'26px', fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input id="order-search" placeholder="Search by ID or customer…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {['all','pending','confirmed','fulfilled','cancelled'].map(s => (
          <button key={s} id={`filter-${s}`} className={`btn ${filterStatus===s ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={()=>setFilterStatus(s)}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="card" style={{ padding:0 }}>
        <div className="table-wrapper" style={{ border:'none' }}>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td className="strong" style={{ fontFamily:'var(--font-mono)' }}>{o.id}</td>
                  <td>{o.customer}</td>
                  <td style={{ fontSize:'12px' }}>{o.items.map(i=>`${i.name} ×${i.qty}`).join(', ')}</td>
                  <td style={{ color:'var(--color-warning)', fontWeight:600 }}>-${o.discount}</td>
                  <td className="strong" style={{ color:'var(--color-accent)' }}>${o.total}</td>
                  <td><span className={`badge ${STATUS_BADGE[o.status] ?? 'badge-muted'}`}>{o.status}</span></td>
                  <td style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>{new Date(o.created_at).toLocaleString()}</td>
                  <td>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button id={`view-order-${o.id}`} className="btn btn-secondary btn-sm" onClick={()=>setSelected(o)}>👁 View</button>
                      {o.status === 'pending' && (
                        <button id={`confirm-order-${o.id}`} className="btn btn-primary btn-sm"
                          onClick={()=>setOrders(prev=>prev.map(x=>x.id===o.id?{...x,status:'confirmed'}:x))}>
                          ✓ Confirm
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Order {selected.id}</h2>
              <button className="modal-close" id="close-order-modal" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><div className="form-label">Customer</div><div style={{ fontWeight:600 }}>{selected.customer}</div></div>
                <div><div className="form-label">Status</div><span className={`badge ${STATUS_BADGE[selected.status]??'badge-muted'}`}>{selected.status}</span></div>
              </div>
              <div className="divider" />
              <div>
                <div className="form-label" style={{ marginBottom:'8px' }}>Order Items</div>
                {selected.items.map((item,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px', background:'rgba(255,255,255,0.03)', borderRadius:'8px', marginBottom:'6px' }}>
                    <span>{item.name} × {item.qty}</span>
                    <span style={{ fontWeight:600, color:'var(--color-text-primary)' }}>${(item.unit_price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:'var(--color-accent-glow)', borderRadius:'10px', padding:'16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                  <span style={{ color:'var(--color-text-secondary)' }}>Discount Applied</span>
                  <span style={{ color:'var(--color-warning)', fontWeight:600 }}>-${selected.discount}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'18px', fontWeight:800 }}>
                  <span>Total</span>
                  <span style={{ color:'var(--color-accent)' }}>${selected.total}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setSelected(null)}>Close</button>
              {selected.status === 'pending' && (
                <button id="confirm-from-modal" className="btn btn-primary" onClick={()=>{setOrders(prev=>prev.map(x=>x.id===selected.id?{...x,status:'confirmed'}:x));setSelected(null);}}>
                  ✓ Confirm Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
