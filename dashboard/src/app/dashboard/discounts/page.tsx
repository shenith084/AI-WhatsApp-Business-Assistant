'use client';

import { useState } from 'react';

const DEMO_RULES = [
  { id: 'r1', rule_name: 'Small Bulk — 5% off',       product_category: null,       min_qty: 10, max_qty: 19, type: 'percentage', value: 5,   valid_from: '2026-08-01', valid_to: '2026-12-31', active: true },
  { id: 'r2', rule_name: 'Medium Bulk — 10% off',      product_category: null,       min_qty: 20, max_qty: 49, type: 'percentage', value: 10,  valid_from: '2026-08-01', valid_to: '2026-12-31', active: true },
  { id: 'r3', rule_name: 'Large Bulk — 15% off',       product_category: null,       min_qty: 50, max_qty: null, type: 'percentage', value: 15, valid_from: '2026-08-01', valid_to: '2026-12-31', active: true },
  { id: 'r4', rule_name: 'T-Shirt Bulk — 12% off',    product_category: 'tshirt',   min_qty: 30, max_qty: null, type: 'percentage', value: 12, valid_from: '2026-08-01', valid_to: '2026-12-31', active: true },
  { id: 'r5', rule_name: 'Accessories Flash — $5 each',product_category: 'accessories', min_qty: 5, max_qty: null, type: 'fixed_price', value: 5, valid_from: '2026-08-05', valid_to: '2026-08-18', active: true },
];

type Rule = typeof DEMO_RULES[0];

export default function DiscountsPage() {
  const [rules, setRules] = useState(DEMO_RULES);
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState<Rule | null>(null);
  const [form, setForm] = useState({ rule_name:'', product_category:'', min_qty:'', max_qty:'', type:'percentage', value:'', valid_from:'', valid_to:'' });

  function openNew() { setEditRule(null); setForm({ rule_name:'', product_category:'', min_qty:'', max_qty:'', type:'percentage', value:'', valid_from:'', valid_to:'' }); setShowModal(true); }
  function openEdit(r: Rule) {
    setEditRule(r);
    setForm({ rule_name: r.rule_name, product_category: r.product_category ?? '', min_qty: String(r.min_qty), max_qty: r.max_qty ? String(r.max_qty):'', type:r.type, value: String(r.value), valid_from: r.valid_from, valid_to: r.valid_to });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.rule_name || !form.min_qty || !form.value) return;
    if (editRule) {
      setRules(prev => prev.map(r => r.id === editRule.id
        ? { ...r, ...form, product_category: form.product_category||null, min_qty: parseInt(form.min_qty), max_qty: form.max_qty ? parseInt(form.max_qty):null, value: parseFloat(form.value) }
        : r
      ));
    } else {
      setRules(prev => [...prev, { id:`r${Date.now()}`, ...form, product_category: form.product_category||null, min_qty: parseInt(form.min_qty), max_qty: form.max_qty ? parseInt(form.max_qty):null, value: parseFloat(form.value), active: true }]);
    }
    setShowModal(false);
  }

  function toggleActive(id: string) { setRules(prev => prev.map(r => r.id === id ? {...r, active:!r.active} : r)); }

  // Live pricing simulator
  const [simQty, setSimQty] = useState(25);
  const [simCat, setSimCat] = useState('');
  const bestRule = rules.filter(r => r.active && r.min_qty <= simQty && (!r.max_qty || r.max_qty >= simQty) && (!r.product_category || r.product_category === simCat || simCat===''))
    .sort((a,b) => b.value - a.value)[0];

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Discount Rules</h1>
          <p className="page-subtitle">{rules.length} rules · Best rule wins (no stacking)</p>
        </div>
        <button id="add-discount-btn" className="btn btn-primary" onClick={openNew}>+ Add Rule</button>
      </div>

      <div className="section-grid">
        {/* Rules Table */}
        <div className="card section-full">
          <div className="card-header">
            <span className="card-title">Active Rules</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Category</th>
                  <th>Qty Range</th>
                  <th>Discount</th>
                  <th>Valid Period</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r.id}>
                    <td className="strong">{r.rule_name}</td>
                    <td><span className="badge badge-muted">{r.product_category ?? 'All Categories'}</span></td>
                    <td style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>
                      {r.min_qty} – {r.max_qty ?? '∞'}
                    </td>
                    <td>
                      <span style={{ fontWeight:700, color:'var(--color-accent)' }}>
                        {r.type === 'percentage' ? `${r.value}% off` : `$${r.value}/item`}
                      </span>
                    </td>
                    <td style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>
                      {r.valid_from} → {r.valid_to}
                    </td>
                    <td><span className={`badge ${r.active ? 'badge-success' : 'badge-muted'}`}>{r.active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button id={`edit-rule-${r.id}`} className="btn btn-secondary btn-sm" onClick={()=>openEdit(r)}>✏️</button>
                        <button id={`toggle-rule-${r.id}`} className="btn btn-secondary btn-sm" onClick={()=>toggleActive(r.id)}>
                          {r.active ? '⏸' : '▶'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Simulator */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🧮 Pricing Simulator</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input id="sim-qty" className="form-input" type="number" value={simQty} onChange={e=>setSimQty(parseInt(e.target.value)||0)} />
            </div>
            <div className="form-group">
              <label className="form-label">Category (optional)</label>
              <select id="sim-cat" className="form-select" value={simCat} onChange={e=>setSimCat(e.target.value)}>
                <option value="">Any Category</option>
                <option value="tshirt">T-Shirt</option>
                <option value="dress">Dress</option>
                <option value="trousers">Trousers</option>
                <option value="jacket">Jacket</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            {bestRule ? (
              <div style={{ background:'var(--color-accent-glow)', border:'1px solid rgba(37,211,102,0.2)', borderRadius:'12px', padding:'16px' }}>
                <div style={{ fontSize:'12px', color:'var(--color-text-muted)', marginBottom:'8px' }}>Best Rule Applied</div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'var(--color-accent)', marginBottom:'4px' }}>{bestRule.rule_name}</div>
                <div style={{ fontSize:'14px', color:'var(--color-text-secondary)' }}>
                  {bestRule.type === 'percentage' ? `${bestRule.value}% discount` : `Fixed $${bestRule.value}/item`}
                </div>
                <div style={{ marginTop:'12px', padding:'12px', background:'rgba(0,0,0,0.2)', borderRadius:'8px', fontFamily:'var(--font-mono)', fontSize:'13px' }}>
                  {bestRule.type === 'percentage'
                    ? `e.g. 100 qty × $10 = $1000\n→ ${bestRule.value}% off = $${(1000 * (1 - bestRule.value/100)).toFixed(2)}`
                    : `e.g. ${simQty} qty × $${bestRule.value} = $${(simQty * bestRule.value).toFixed(2)}`
                  }
                </div>
              </div>
            ) : (
              <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'12px', padding:'16px', fontSize:'13px', color:'var(--color-danger)' }}>
                No discount rule applies for qty {simQty}{simCat ? ` + ${simCat}` : ''}.
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="card">
          <div className="card-header"><span className="card-title">ℹ️ How Rules Work</span></div>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px', fontSize:'13px', color:'var(--color-text-secondary)' }}>
            <div>✅ <strong style={{color:'var(--color-text-primary)'}}>Best rule wins</strong> — only the highest-value applicable rule is applied. Rules never stack.</div>
            <div>📦 <strong style={{color:'var(--color-text-primary)'}}>Quantity range</strong> — rule applies when order qty falls between min and max (inclusive).</div>
            <div>🏷️ <strong style={{color:'var(--color-text-primary)'}}>Category-specific</strong> rules take priority over "all categories" rules at the same discount level.</div>
            <div>📅 <strong style={{color:'var(--color-text-primary)'}}>Validity dates</strong> — rule is ignored outside its valid_from / valid_to window.</div>
            <div>💰 <strong style={{color:'var(--color-text-primary)'}}>fixed_price</strong> overrides the unit price per item (e.g. accessories flash sale at $5 each).</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editRule ? 'Edit Rule' : 'Add Discount Rule'}</h2>
              <button className="modal-close" id="close-discount-modal" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div className="form-group">
                <label className="form-label">Rule Name *</label>
                <input id="rule-name" className="form-input" placeholder="e.g. Summer Bulk 15% off" value={form.rule_name} onChange={e=>setForm({...form,rule_name:e.target.value})} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category (blank = all)</label>
                  <select id="rule-category" className="form-select" value={form.product_category} onChange={e=>setForm({...form,product_category:e.target.value})}>
                    <option value="">All Categories</option>
                    <option value="tshirt">T-Shirt</option>
                    <option value="dress">Dress</option>
                    <option value="trousers">Trousers</option>
                    <option value="jacket">Jacket</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Type *</label>
                  <select id="rule-type" className="form-select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                    <option value="percentage">Percentage off</option>
                    <option value="fixed_price">Fixed price/item</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Min Qty *</label>
                  <input id="rule-min-qty" className="form-input" type="number" placeholder="10" value={form.min_qty} onChange={e=>setForm({...form,min_qty:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Qty (blank = unlimited)</label>
                  <input id="rule-max-qty" className="form-input" type="number" placeholder="49" value={form.max_qty} onChange={e=>setForm({...form,max_qty:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Value * ({form.type === 'percentage' ? '%' : '$'})</label>
                  <input id="rule-value" className="form-input" type="number" step="0.01" placeholder={form.type === 'percentage' ? '10' : '5.00'} value={form.value} onChange={e=>setForm({...form,value:e.target.value})} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Valid From</label>
                  <input id="rule-valid-from" className="form-input" type="date" value={form.valid_from} onChange={e=>setForm({...form,valid_from:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Valid To</label>
                  <input id="rule-valid-to" className="form-input" type="date" value={form.valid_to} onChange={e=>setForm({...form,valid_to:e.target.value})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button id="cancel-discount" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button id="save-discount" className="btn btn-primary" onClick={handleSave}>{editRule ? 'Save Changes' : 'Add Rule'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
