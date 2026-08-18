'use client';

import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/app/actions';
import { showAlert, showToast } from '@/app/utils/swal';

const STATUS_BADGE: Record<string, string> = {
  'pending': 'badge-gray',
  'confirmed': 'badge-warning',
  'fulfilled': 'badge-success',
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
      showAlert("Error updating status", error.message);
    } else {
      showToast("Order status updated successfully!");
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

      <div className="filter-tabs">
        {['All Orders', 'Pending', 'Confirmed', 'Fulfilled', 'Cancelled'].map(s => {
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
                    <button className="btn-secondary btn-sm" onClick={() => openEdit(o)}>View Details</button>
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
          <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth: '650px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className="modal-title" style={{ marginBottom: '4px' }}>Order {editOrder.id.substring(0, 8).toUpperCase()}</h2>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Placed on {new Date(editOrder.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button className="btn-icon" onClick={()=>setShowModal(false)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Customer Info</div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-main)', marginBottom: '2px' }}>
                  {editOrder.customers?.name || 'Guest'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{editOrder.customer_number}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Order Summary</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Payment Method</span>
                  <span style={{ fontWeight: 500 }}>
                    {editOrder.payment_method === 'cod' ? 'Cash on Delivery' : 
                     editOrder.payment_method === 'card' ? 'Credit Card' : 
                     (editOrder.payment_method || 'N/A').toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--color-border)' }}>
                  <span style={{ fontWeight: 600 }}>Total Price</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>LKR {(editOrder.total_price || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Order Items</div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead style={{ background: '#f1f5f9', borderBottom: '1px solid var(--color-border)' }}>
                    <tr>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)' }}>Product</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-muted)' }}>Qty</th>
                      <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let items = [];
                      try {
                        items = typeof editOrder.items === 'string' ? JSON.parse(editOrder.items) : editOrder.items || [];
                      } catch (e) {
                        items = [];
                      }
                      if (!Array.isArray(items) || items.length === 0) {
                        return <tr><td colSpan={3} style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No items found</td></tr>;
                      }
                      return items.map((item: any, idx: number) => {
                        const qty = item.qty || item.quantity || 1;
                        const price = item.unit_price || item.price || 0;
                        return (
                          <tr key={idx} style={{ borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--color-border)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 500 }}>{item.product_name || item.name || 'Unknown Item'}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>x{qty}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500 }}>LKR {(price * qty).toLocaleString()}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', marginTop: '8px' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
                <label className="form-label" style={{ marginBottom: '6px' }}>Update Order Status</label>
                <select className="form-input form-select" value={newStatus} onChange={e=>setNewStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={handleSaveStatus}>
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
