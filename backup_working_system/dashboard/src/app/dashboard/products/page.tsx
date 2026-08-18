'use client';

import { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, getSettings } from '@/app/actions';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({ 
    name: '', sku: '', category: '', price: '', stock: '', 
    status: 'Active', fabric: '', description: '', sizes: '', colors: '' 
  });
  const [businessId, setBusinessId] = useState('');

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await getProducts();
    if (!error && data) {
      setProducts(data);
      if (data.length > 0) setBusinessId(data[0].business_id);
    }
    setLoading(false);
  }

  function openNew() {
    setEditProduct(null);
    setForm({ 
      name: '', sku: '', category: '', price: '', stock: '0', 
      status: 'Active', fabric: '', description: '', sizes: '', colors: '' 
    });
    setShowModal(true);
  }

  function openEdit(p: any) {
    setEditProduct(p);
    setForm({
      name: p.name,
      sku: p.variants?.sku || p.id,
      category: p.category || '',
      price: String(p.price),
      stock: String(p.stock),
      status: p.is_active ? 'Active' : 'Inactive',
      fabric: p.variants?.fabric || '',
      description: p.description || '',
      sizes: p.variants?.size ? p.variants.size.join(', ') : '',
      colors: p.variants?.color ? p.variants.color.join(', ') : ''
    });
    setBusinessId(p.business_id);
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      alert("Name and Price are required.");
      return;
    }

    const payload = {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
      is_active: form.status === 'Active',
      description: form.description,
      variants: {
        sku: form.sku,
        fabric: form.fabric,
        size: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        color: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : []
      },
      business_id: businessId || '00000000-0000-0000-0000-000000000000'
    };

    if (editProduct) {
      const { error } = await updateProduct(editProduct.id, payload);
      if (error) alert(error.message);
    } else {
      const { error } = await addProduct(payload);
      if (error) alert(error.message);
    }
    setShowModal(false);
    fetchProducts();
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this product?")) {
      const { error } = await deleteProduct(id);
      if (error) alert(error.message);
      fetchProducts();
    }
  }

  const activeCount = products.filter(p => p.is_active).length;
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
          <h1 className="page-title">Products</h1>
          <div className="breadcrumb">Dashboard &gt; Products</div>
        </div>
        <button className="btn btn-primary" onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'normal' }}>+</span> Add Product
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>⭕</div>
          <div className="metric-info">
            <div className="metric-title">Total Products</div>
            <div className="metric-value">{products.length}</div>
            <div className="metric-sub" style={{ color: 'var(--color-success-text)' }}>Live update</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>⚬</div>
          <div className="metric-info">
            <div className="metric-title">Active Products</div>
            <div className="metric-value">{activeCount}</div>
            <div className="metric-sub" style={{ color: 'var(--color-success-text)' }}>Live update</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#fef2f2', color: '#dc2626' }}>!</div>
          <div className="metric-info">
            <div className="metric-title">Out of Stock</div>
            <div className="metric-value">{outOfStock}</div>
            <div className="metric-sub" style={{ color: 'var(--color-danger-text)' }}>Needs attention</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>!</div>
          <div className="metric-info">
            <div className="metric-title">Low Stock</div>
            <div className="metric-value">{lowStock}</div>
            <div className="metric-sub" style={{ color: 'var(--color-danger-text)' }}>&lt;= 5 items</div>
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
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>SKU</th>
              <th>CATEGORY</th>
              <th>PRICE (LKR)</th>
              <th>STOCK</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Loading products...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No products found.</td></tr>
            ) : filtered.map(p => {
              const sizes = p.variants?.size ? p.variants.size.join(', ') : 'N/A';
              const colors = p.variants?.color ? p.variants.color.join(', ') : 'N/A';
              const sku = p.variants?.sku || p.id.substring(0, 8).toUpperCase();
              
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Size: {sizes} | Color: {colors}
                    </div>
                  </td>
                  <td>{sku}</td>
                  <td><span style={{ textTransform: 'capitalize' }}>{p.category || 'N/A'}</span></td>
                  <td style={{ fontWeight: 600 }}>LKR {(p.price).toLocaleString()}</td>
                  <td>{p.stock}</td>
                  <td>
                    {p.is_active ? (
                      p.stock === 0 ? <span className="badge badge-danger">Out of Stock</span> :
                      p.stock <= 5 ? <span className="badge badge-warning">Low Stock</span> :
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-gray">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-icon" onClick={() => openEdit(p)}>✏️</button>
                      <button className="btn-icon" onClick={() => handleDelete(p.id)} style={{ color: 'var(--color-danger-text)' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{ 
            maxWidth: '680px', 
            width: '100%', 
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: 'none' }}>
              <h2 className="modal-title" style={{ fontSize: '18px', fontWeight: 700 }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            
            <div style={{ padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Name</label>
                  <input className="form-input" placeholder="e.g. Floral Maxi Dress" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SKU</label>
                  <input className="form-input" placeholder="e.g. MM-DRESS-001" value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price (LKR)</label>
                  <input className="form-input" type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</label>
                  <input className="form-input" type="number" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
                  <select className="form-input" style={{ appearance: 'none', backgroundColor: '#fff', cursor: 'pointer' }} value={form.category} onChange={e=>setForm({...form, category: e.target.value})}>
                    <option value="">Select Category</option>
                    <option value="New Arrivals">New Arrivals</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Tops">Tops</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                  <select className="form-input" style={{ appearance: 'none', backgroundColor: '#fff', cursor: 'pointer' }} value={form.status} onChange={e=>setForm({...form, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fabric</label>
                <input className="form-input" placeholder="e.g. 100% Cotton" value={form.fabric} onChange={e=>setForm({...form, fabric: e.target.value})} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                <textarea className="form-input" style={{ minHeight: '100px', resize: 'vertical' }} value={form.description} onChange={e=>setForm({...form, description: e.target.value})}></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sizes (Comma Separated)</label>
                  <input className="form-input" placeholder="e.g. S, M, L, XL" value={form.sizes} onChange={e=>setForm({...form, sizes: e.target.value})} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Colors (Comma Separated)</label>
                  <input className="form-input" placeholder="e.g. Red, Blue, Black" value={form.colors} onChange={e=>setForm({...form, colors: e.target.value})} />
                </div>
              </div>

              <div style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={()=>setShowModal(false)}
                  style={{ 
                    padding: '10px 24px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    background: 'white', 
                    color: '#64748b',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  style={{ 
                    padding: '10px 24px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    background: 'var(--color-primary)', 
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                  {editProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </>
  );
}
