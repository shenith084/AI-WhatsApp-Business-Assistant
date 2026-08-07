'use client';

import { useState } from 'react';

const DEMO_PRODUCTS = [
  { id: 'p1', name: 'Premium Cotton T-Shirt', category: 'tshirt',      price: 10.00, stock: 500, tags: ['best seller','bulk popular'], active: true },
  { id: 'p2', name: 'Polo T-Shirt',           category: 'tshirt',      price: 15.00, stock: 300, tags: ['corporate'],                  active: true },
  { id: 'p3', name: 'V-Neck T-Shirt',         category: 'tshirt',      price: 9.00,  stock: 200, tags: ['new','women favourite'],       active: true },
  { id: 'p4', name: 'Floral Midi Dress',      category: 'dress',       price: 35.00, stock: 80,  tags: ['best seller','new arrival'],   active: true },
  { id: 'p5', name: 'Evening Gown',           category: 'dress',       price: 85.00, stock: 30,  tags: ['premium','limited'],           active: true },
  { id: 'p6', name: 'Slim-Fit Chinos',        category: 'trousers',    price: 22.00, stock: 250, tags: ['best seller','men'],           active: true },
  { id: 'p7', name: 'Formal Dress Trousers',  category: 'trousers',    price: 28.00, stock: 180, tags: ['formal','corporate'],          active: true },
  { id: 'p8', name: 'Denim Jacket',           category: 'jacket',      price: 45.00, stock: 90,  tags: ['best seller','trending'],      active: true },
  { id: 'p9', name: 'Bomber Jacket',          category: 'jacket',      price: 55.00, stock: 60,  tags: ['new arrival','trending'],      active: true },
  { id: 'p10',name: 'Canvas Tote Bag',        category: 'accessories', price: 6.00,  stock: 600, tags: ['bulk popular','eco-friendly'], active: true },
];

const CATEGORY_LABELS: Record<string, string> = {
  tshirt: '👕 T-Shirt', dress: '👗 Dress', trousers: '👖 Trousers',
  jacket: '🧥 Jacket', accessories: '🎒 Accessories'
};

export default function ProductsPage() {
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProd, setEditProd] = useState<typeof DEMO_PRODUCTS[0] | null>(null);
  const [form, setForm] = useState({ name: '', category: 'tshirt', price: '', stock: '', description: '', tags: '' });

  const filtered = products.filter(p =>
    (filterCat === 'all' || p.category === filterCat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function openNew() { setEditProd(null); setForm({ name:'', category:'tshirt', price:'', stock:'', description:'', tags:'' }); setShowModal(true); }
  function openEdit(p: typeof DEMO_PRODUCTS[0]) {
    setEditProd(p);
    setForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), description: '', tags: p.tags.join(', ') });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name || !form.price) return;
    if (editProd) {
      setProducts(prev => prev.map(p => p.id === editProd.id
        ? { ...p, ...form, price: parseFloat(form.price), stock: parseInt(form.stock)||0, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) }
        : p
      ));
    } else {
      setProducts(prev => [...prev, {
        id: `p${Date.now()}`, ...form,
        price: parseFloat(form.price), stock: parseInt(form.stock)||0,
        tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean), active: true
      }]);
    }
    setShowModal(false);
  }

  function toggleActive(id: string) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} items in catalog · {products.filter(p=>p.active).length} active</p>
        </div>
        <button id="add-product-btn" className="btn btn-primary" onClick={openNew}>+ Add Product</button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'24px', flexWrap:'wrap', alignItems:'center' }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input id="product-search" placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select id="category-filter" className="form-select" style={{ width:'auto' }} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Products Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px' }}>
        {filtered.map(p => (
          <div key={p.id} className="card" style={{ opacity: p.active ? 1 : 0.5 }}>
            <div style={{
              width:'100%', height:'120px', borderRadius:'10px', marginBottom:'16px',
              background:'linear-gradient(135deg, rgba(37,211,102,0.1), rgba(18,140,126,0.06))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'40px', border:'1px solid var(--color-border)'
            }}>
              {p.category === 'tshirt' ? '👕' : p.category === 'dress' ? '👗' : p.category === 'trousers' ? '👖' : p.category === 'jacket' ? '🧥' : '🎒'}
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
              <span style={{ fontSize:'14px', fontWeight:700, color:'var(--color-text-primary)' }}>{p.name}</span>
              <span style={{ fontSize:'16px', fontWeight:800, color:'var(--color-accent)', whiteSpace:'nowrap' }}>${p.price.toFixed(2)}</span>
            </div>

            <div style={{ display:'flex', gap:'6px', marginBottom:'12px', flexWrap:'wrap' }}>
              <span className="badge badge-accent">{CATEGORY_LABELS[p.category]}</span>
              {p.tags.slice(0,2).map(t => <span key={t} className="badge badge-muted">{t}</span>)}
            </div>

            <div style={{ fontSize:'12px', color:'var(--color-text-muted)', marginBottom:'16px' }}>
              Stock: <span style={{ color: p.stock > 50 ? 'var(--color-success)' : 'var(--color-warning)', fontWeight:600 }}>{p.stock} units</span>
            </div>

            <div style={{ display:'flex', gap:'8px' }}>
              <button id={`edit-prod-${p.id}`} className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={()=>openEdit(p)}>✏️ Edit</button>
              <button id={`toggle-prod-${p.id}`} className="btn btn-secondary btn-sm" onClick={()=>toggleActive(p.id)}>
                {p.active ? '⏸ Hide' : '▶ Show'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editProd ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close" id="close-product-modal" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input id="prod-name" className="form-input" placeholder="e.g. Premium Cotton T-Shirt" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select id="prod-category" className="form-select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                    {Object.entries(CATEGORY_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (USD) *</label>
                  <input id="prod-price" className="form-input" type="number" step="0.01" placeholder="0.00" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock (units)</label>
                  <input id="prod-stock" className="form-input" type="number" placeholder="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input id="prod-tags" className="form-input" placeholder="best seller, new" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea id="prod-desc" className="form-textarea" placeholder="Product description…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button id="cancel-product" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button id="save-product" className="btn btn-primary" onClick={handleSave}>
                {editProd ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
