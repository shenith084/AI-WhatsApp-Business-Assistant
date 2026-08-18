'use client';

import { useState, useEffect } from 'react';
import { getDiscounts, addDiscountRule, updateDiscountRule, deleteDiscountRule, getAuthSession } from '@/app/actions';
import { showAlert, showConfirm, showToast } from '@/app/utils/swal';

export default function DiscountsPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState<any>(null);
  const [form, setForm] = useState({ rule_name:'', product_category:'', min_quantity:'', max_quantity:'', discount_type:'percentage', discount_value:'', valid_from:'', valid_to:'', is_active: true });
  const [businessId, setBusinessId] = useState('');

  useEffect(() => {
    async function init() {
      const session = await getAuthSession();
      if (session?.business_id) setBusinessId(session.business_id);
      fetchRules();
    }
    init();
  }, []);

  async function fetchRules() {
    setLoading(true);
    const { data, error } = await getDiscounts();
    if (!error && data) {
      setRules(data);
    }
    setLoading(false);
  }

  function openNew() { 
    setEditRule(null); 
    setForm({ rule_name:'', product_category:'', min_quantity:'', max_quantity:'', discount_type:'percentage', discount_value:'', valid_from:'', valid_to:'', is_active: true }); 
    setShowModal(true); 
  }

  function openEdit(r: any) {
    setEditRule(r);
    setForm({ 
      rule_name: r.rule_name || '', 
      product_category: r.product_category || '', 
      min_quantity: String(r.min_quantity || ''), 
      max_quantity: r.max_quantity ? String(r.max_quantity):'', 
      discount_type: r.discount_type || 'percentage', 
      discount_value: String(r.discount_value || ''), 
      valid_from: r.valid_from || '', 
      valid_to: r.valid_to || '',
      is_active: r.is_active !== false
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.rule_name || !form.min_quantity || !form.discount_value) {
      showAlert("Validation Error", "Name, Min Qty, and Discount Value are required.", "warning");
      return;
    }

    if (form.max_quantity && parseInt(form.max_quantity) < parseInt(form.min_quantity)) {
      showAlert("Validation Error", "Max Quantity cannot be less than Min Quantity.", "warning");
      return;
    }

    const payload = {
      rule_name: form.rule_name,
      product_category: form.product_category || null,
      min_quantity: parseInt(form.min_quantity),
      max_quantity: form.max_quantity ? parseInt(form.max_quantity) : null,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      valid_from: form.valid_from || null,
      valid_to: form.valid_to || null,
      is_active: form.is_active,
      business_id: businessId || '00000000-0000-0000-0000-000000000000'
    };

    if (editRule) {
      const { error } = await updateDiscountRule(editRule.id, payload);
      if (error) {
        showAlert("Error updating rule", error.message);
      } else {
        showToast("Discount rule updated successfully!");
      }
    } else {
      const { error } = await addDiscountRule(payload);
      if (error) {
        showAlert("Error adding rule", error.message);
      } else {
        showToast("Discount rule added successfully!");
      }
    }
    setShowModal(false);
    fetchRules();
  }

  async function toggleActive(id: string, currentActive: boolean) { 
    await updateDiscountRule(id, { is_active: !currentActive });
    fetchRules();
  }

  async function handleDelete(id: string) {
    if (await showConfirm("Delete Rule", "Are you sure you want to delete this discount rule?", "Yes, delete it")) {
      const { error } = await deleteDiscountRule(id);
      if (error) {
        showAlert("Error deleting rule", error.message);
      } else {
        showToast("Discount rule deleted!");
      }
      fetchRules();
    }
  }



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
            <span className="card-title">Rules Engine</span>
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
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
                ) : rules.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No discount rules found.</td></tr>
                ) : rules.map(r => (
                  <tr key={r.id}>
                    <td className="strong">{r.rule_name}</td>
                    <td><span className="badge badge-muted">{r.product_category ?? 'All Categories'}</span></td>
                    <td style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>
                      {r.min_quantity} – {r.max_quantity ?? '∞'}
                    </td>
                    <td>
                      <span style={{ fontWeight:700, color:'var(--color-accent)' }}>
                        {r.discount_type === 'percentage' ? `${r.discount_value}% off` : `$${r.discount_value}/item`}
                      </span>
                    </td>
                    <td style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>
                      {r.valid_from || 'Always'} → {r.valid_to || 'Always'}
                    </td>
                    <td><span className={`badge ${r.is_active !== false ? 'badge-success' : 'badge-muted'}`}>{r.is_active !== false ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button id={`edit-rule-${r.id}`} className="btn btn-secondary btn-sm" onClick={()=>openEdit(r)}>✏️</button>
                        <button id={`toggle-rule-${r.id}`} className="btn btn-secondary btn-sm" onClick={()=>toggleActive(r.id, r.is_active !== false)}>
                          {r.is_active !== false ? '⏸' : '▶'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(r.id)} style={{ color: 'var(--color-danger-text)' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editRule ? 'Edit Rule' : 'Add Discount Rule'}</h2>
              <button className="modal-close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div style={{ padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Rule Name *</label>
                <input className="form-input" placeholder="e.g. Summer Bulk 15% off" value={form.rule_name} onChange={e=>setForm({...form,rule_name:e.target.value})} />
              </div>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category (blank = all)</label>
                  <input className="form-input" placeholder="e.g. tshirt" value={form.product_category} onChange={e=>setForm({...form,product_category:e.target.value})} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Discount Type *</label>
                  <select className="form-input form-select" value={form.discount_type} onChange={e=>setForm({...form,discount_type:e.target.value})}>
                    <option value="percentage">Percentage off</option>
                    <option value="fixed_price">Fixed price/item</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Min Qty *</label>
                  <input className="form-input" type="number" placeholder="10" value={form.min_quantity} onChange={e=>setForm({...form,min_quantity:e.target.value})} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Max Qty (blank = unlimited)</label>
                  <input className="form-input" type="number" placeholder="49" value={form.max_quantity} onChange={e=>setForm({...form,max_quantity:e.target.value})} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Value * ({form.discount_type === 'percentage' ? '%' : '$'})</label>
                  <input className="form-input" type="number" step="0.01" placeholder={form.discount_type === 'percentage' ? '10' : '5.00'} value={form.discount_value} onChange={e=>setForm({...form,discount_value:e.target.value})} />
                </div>
              </div>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Valid From</label>
                  <input className="form-input" type="date" value={form.valid_from} onChange={e=>setForm({...form,valid_from:e.target.value})} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Valid To</label>
                  <input className="form-input" type="date" value={form.valid_to} onChange={e=>setForm({...form,valid_to:e.target.value})} />
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '12px', padding: '24px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-border)' }}>
                <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>{editRule ? 'Save Changes' : 'Add Rule'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
