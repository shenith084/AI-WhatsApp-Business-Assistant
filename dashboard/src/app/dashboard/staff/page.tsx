'use client';

import { useState, useEffect } from 'react';
import { getStaff, addStaff, updateStaff, deleteStaff, getAuthSession } from '@/app/actions';
import { showAlert, showConfirm, showToast } from '@/app/utils/swal';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'staff', password: '', is_active: true });
  const [businessId, setBusinessId] = useState('');

  useEffect(() => {
    async function init() {
      const session = await getAuthSession();
      if (session?.business_id) setBusinessId(session.business_id);
      fetchStaff();
    }
    init();
  }, []);

  async function fetchStaff() {
    setLoading(true);
    const { data, error } = await getStaff();
    if (!error && data) {
      setStaff(data);
    }
    setLoading(false);
  }

  function openNew() {
    setEditStaff(null);
    setForm({ name: '', email: '', role: 'staff', password: '', is_active: true });
    setShowModal(true);
  }

  function openEdit(s: any) {
    setEditStaff(s);
    setForm({
      name: s.name,
      email: s.email,
      role: s.role,
      password: '', // Don't show existing hash/password
      is_active: s.is_active
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.email) {
      showAlert("Validation Error", "Name and Email are required.", "warning");
      return;
    }

    const payload: any = {
      name: form.name,
      email: form.email,
      role: form.role,
      is_active: form.is_active,
      business_id: businessId || '00000000-0000-0000-0000-000000000000'
    };

    if (form.password) {
      payload.password_hash = form.password; // For MVP, we save plain text.
    }

    if (editStaff) {
      const { error } = await updateStaff(editStaff.id, payload);
      if (error) {
        showAlert("Error updating staff", error.message);
      } else {
        showToast("Staff updated successfully!");
      }
    } else {
      const { error } = await addStaff(payload);
      if (error) {
        showAlert("Error adding staff", error.message);
      } else {
        showToast("Staff added successfully!");
      }
    }
    setSearch('');
    setShowModal(false);
    fetchStaff();
  }

  async function handleDelete(id: string) {
    if (await showConfirm("Remove Staff", "Are you sure you want to remove this staff member?", "Yes, remove them")) {
      const { error } = await deleteStaff(id);
      if (error) {
        showAlert("Error removing staff", error.message);
      } else {
        showToast("Staff member removed!");
      }
      fetchStaff();
    }
  }

  const activeStaff = staff.filter(s => s.is_active).length;
  const inactiveStaff = staff.filter(s => !s.is_active).length;
  const admins = staff.filter(s => s.role.includes('business_owner') || s.role.includes('admin')).length;

  const filtered = staff.filter(s =>
    (s.name && s.name.toLowerCase().includes(search.toLowerCase())) || 
    (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <div className="breadcrumb">Dashboard &gt; Staff Management</div>
        </div>
        <button className="btn btn-primary" onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'normal' }}>+</span> Add Staff
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>👥</div>
          <div className="metric-info">
            <div className="metric-title">Total Staff</div>
            <div className="metric-value">{staff.length}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>👤</div>
          <div className="metric-info">
            <div className="metric-title">Active Staff</div>
            <div className="metric-value">{activeStaff}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#fef2f2', color: '#dc2626' }}>🚫</div>
          <div className="metric-info">
            <div className="metric-title">Inactive Staff</div>
            <div className="metric-value">{inactiveStaff}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>🛡️</div>
          <div className="metric-info">
            <div className="metric-title">Admins</div>
            <div className="metric-value">{admins}</div>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <input 
          type="search" 
          name="staff-search-input-field"
          autoComplete="new-password"
          className="search-input" 
          style={{ maxWidth: '800px', width: '100%' }}
          placeholder="🔍 Search by name or email..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>STAFF MEMBER</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>EMAIL</th>
              <th>JOINED ON</th>
              <th>LAST ACTIVE</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Loading staff data...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No staff members found.</td></tr>
            ) : filtered.map(s => {
              const initial = s.name ? s.name.charAt(0).toUpperCase() : 'U';
              
              return (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        {initial}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {s.name}
                          {s.role === 'business_owner' && <span style={{ background: '#fffbeb', color: '#d97706', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>OWNER</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${s.role === 'business_owner' ? 'badge-danger' : 'badge-purple'}`} style={{ textTransform: 'capitalize' }}>
                      {s.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {s.is_active ? 
                      <span className="badge badge-success">Active</span> : 
                      <span className="badge badge-gray">Inactive</span>
                    }
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{s.email}</td>
                  <td style={{ fontSize: '12px' }}>{new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={{ fontSize: '12px' }}>{s.last_login_at ? new Date(s.last_login_at).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-icon" onClick={() => openEdit(s)}>✏️</button>
                      {s.role !== 'platform_super_admin' && (
                        <button className="btn-icon" onClick={() => handleDelete(s.id)} style={{ color: 'var(--color-danger-text)' }}>🗑️</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Staff Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editStaff ? 'Edit Staff Member' : 'Add New Staff'}</h2>
              <button className="modal-close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div style={{ padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password {editStaff ? '(Leave blank to keep current)' : '*'}</label>
                <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
              </div>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Role</label>
                  <select className="form-input form-select" value={form.role} onChange={e=>setForm({...form, role: e.target.value})}>
                    <option value="staff">Staff</option>
                    <option value="business_owner">Business Owner</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '30px', marginBottom: 0 }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }} checked={form.is_active} onChange={e=>setForm({...form, is_active: e.target.checked})} />
                  <label className="form-label" style={{ marginBottom: 0 }}>Is Active?</label>
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '12px', padding: '24px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-border)' }}>
                <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>{editStaff ? 'Save Changes' : 'Add Staff'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
