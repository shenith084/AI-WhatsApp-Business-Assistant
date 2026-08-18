'use client';

import { useState, useEffect } from 'react';
import { getStock } from '@/app/actions';

export default function StockPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await getStock();
        if (!error && data) {
          setProducts(data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValue = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0) * 300), 0);
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  const filtered = products.filter(p =>
    (p.name && p.name.toLowerCase().includes(search.toLowerCase())) || 
    (p.id && p.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Management</h1>
          <div className="breadcrumb">Dashboard &gt; Stock Management</div>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'normal' }}>+</span> Adjust Stock
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>📦</div>
          <div className="metric-info">
            <div className="metric-title">Total Stock Items</div>
            <div className="metric-value">{totalStock.toLocaleString()}</div>
            <div className="metric-sub" style={{ color: 'var(--color-text-muted)' }}>Across all products</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>💲</div>
          <div className="metric-info">
            <div className="metric-title">Total Stock Value</div>
            <div className="metric-value" style={{ fontSize: '20px' }}>LKR {totalValue.toLocaleString()}</div>
            <div className="metric-sub" style={{ color: 'var(--color-text-muted)' }}>Based on cost price</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>!</div>
          <div className="metric-info">
            <div className="metric-title">Low Stock Items</div>
            <div className="metric-value">{lowStock}</div>
            <div className="metric-sub" style={{ color: 'var(--color-warning-text)' }}>Need attention</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#fef2f2', color: '#dc2626' }}>🔒</div>
          <div className="metric-info">
            <div className="metric-title">Out of Stock Items</div>
            <div className="metric-value">{outOfStock}</div>
            <div className="metric-sub" style={{ color: 'var(--color-danger-text)' }}>Urgent restock</div>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <input 
          type="text" 
          className="search-input" 
          style={{ maxWidth: '600px' }}
          placeholder="🔍 Search by product name or SKU..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
        <div className="filter-group">
          <select className="filter-btn" style={{ outline: 'none', appearance: 'none' }}>
            <option>All Categories</option>
          </select>
          <select className="filter-btn" style={{ outline: 'none', appearance: 'none' }}>
            <option>Sort by: Low Stock First</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>SKU</th>
              <th>SIZE / COLOR</th>
              <th>STOCK</th>
              <th>STATUS</th>
              <th>LAST UPDATED</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Loading stock data...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No stock items found.</td></tr>
            ) : filtered.map(p => {
              const sizes = p.variants?.size ? p.variants.size.join(', ') : 'N/A';
              const colors = p.variants?.color ? p.variants.color.join(', ') : 'N/A';
              
              let status = 'Active';
              if (p.stock === 0) status = 'Out of Stock';
              else if (!p.is_active) status = 'Inactive';
              
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {p.id}
                    </div>
                  </td>
                  <td>{p.id.substring(0, 8).toUpperCase()}</td>
                  <td>{sizes} / {colors}</td>
                  <td style={{ fontWeight: 700, color: p.stock === 0 ? 'var(--color-danger-text)' : 'inherit' }}>
                    {p.stock}
                  </td>
                  <td><span className={`badge ${status === 'Out of Stock' ? 'badge-danger' : 'badge-purple'}`}>{status}</span></td>
                  <td style={{ fontSize: '12px' }}>{new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <button className="btn" style={{ background: 'transparent', border: '1px solid #fca5a5', color: '#dc2626', padding: '4px 12px', borderRadius: '4px' }}>
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
