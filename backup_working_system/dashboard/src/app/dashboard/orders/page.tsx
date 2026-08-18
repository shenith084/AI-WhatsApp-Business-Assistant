'use client';

import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/app/actions';

const STATUS_BADGE: Record<string, string> = {
  'pending': 'badge-gray',
  'processing': 'badge-warning',
  'confirmed': 'badge-success',
  'shipped': 'badge-success',
  'out_for_delivery': 'badge-purple',
  'delivered': 'badge-success',
  'cancelled': 'badge-danger'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('All Orders');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editOrder, setEditOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data, error } = await getOrders();
      if (error) {
        setFetchError(error.message || JSON.stringify(error));
      } else if (data) {
        setOrders(data);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Server Action Failed');
    }
    setLoading(false);
  }

  function openEdit(o: any) {
    setEditOrder(o);
    setNewStatus(o.status || 'pending');
    setShowModal(true);
  }

  async function handleSaveStatus() {
    if (!editOrder || !newStatus) return;
    const { error } = await updateOrderStatus(editOrder.id, newStatus);
    if (error) {
      alert(error.message);
    } else {
      fetchOrders();
      setShowModal(false);
    }
  }

  const filtered = orders.filter(o => {
    const statusMatch = filterStatus === 'All Orders' || (o.status && o.status.toLowerCase() === filterStatus.toLowerCase());
    const searchMatch = 
      (o.id && o.id.toLowerCase().includes(search.toLowerCase())) ||
      (o.customer_number && o.customer_number.includes(search)) ||
      (o.customers?.name && o.customers.name.toLowerCase().includes(search.toLowerCase()));
    
    return statusMatch && searchMatch;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <div className="breadcrumb">Dashboard &gt; Orders</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['All Orders', 'Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(s => {
          const count = s === 'All Orders' ? orders.length : orders.filter(x => x.status && x.status.toLowerCase() === s.toLowerCase()).length;
          const isActive = filterStatus === s;
          return (
            <button 
              key={s} 
              onClick={() => setFilterStatus(s)}
              style={{
                background: isActive ? '#fef2f2' : 'white',
                border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: '99px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {s}
              <span style={{ 
                background: isActive ? 'white' : '#f1f5f9', 
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                padding: '2px 8px', borderRadius: '10px', fontSize: '11px' 
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="table-controls">
        <input 
          type="text" 
          className="search-input" 
          style={{ maxWidth: '800px', width: '100%' }}
          placeholder="🔍 Search by order ID, customer or phone..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {fetchError ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'red' }}>Error: {fetchError}</td></tr>
            ) : loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Loading orders...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No orders found.</td></tr>
            ) : filtered.map(o => {
              const customerName = o.customers?.name || 'Guest';
              const initial = customerName.charAt(0).toUpperCase();
              
              return (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>{o.id.substring(0, 8).toUpperCase()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        {initial}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{customerName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{o.customer_number}</div>
                      </div>
                    </div>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={{ fontWeight: 600 }}>LKR {(o.total_price).toLocaleString()}</td>
                  <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{o.status?.replace('_', ' ')}</span></td>
                  <td>
                    <button className="btn-secondary btn-sm" onClick={() => openEdit(o)}>Update Status</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order Modal */}
      {showModal && editOrder && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Update Order Status</h2>
              <button className="modal-close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div style={{ padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--color-text-main)', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID:</strong> {editOrder.id.substring(0, 8).toUpperCase()}</div>
                <div><strong style={{ color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer:</strong> {editOrder.customer_number}</div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Order Status</label>
                <select className="form-input form-select" value={newStatus} onChange={e=>setNewStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="modal-footer" style={{ marginTop: '16px', padding: '24px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-border)' }}>
                <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveStatus}>Save Status</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
