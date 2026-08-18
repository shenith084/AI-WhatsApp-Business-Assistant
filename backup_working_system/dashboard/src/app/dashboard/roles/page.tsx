'use client';

import { useState } from 'react';

const ROLES = [
  { id: 'r1', name: 'Super Admin', users: 1, desc: 'Full access to all features and settings.', color: 'badge-danger' },
  { id: 'r2', name: 'Admin',       users: 1, desc: 'Manage almost everything except role & permission.', color: 'badge-purple' },
  { id: 'r3', name: 'Staff',       users: 0, desc: 'Can manage orders, products and customers.', color: 'badge-gray' },
  { id: 'r4', name: 'test',        users: 0, desc: 'for test', color: 'badge-gray' },
];

export default function RolesPage() {
  const [activeRole, setActiveRole] = useState(ROLES[0]);

  return (
    <>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Roles</h1>
          <div className="breadcrumb" style={{ color: 'var(--color-text-main)' }}>Manage user roles and their permissions.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
        
        {/* Left Column - Roles List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ROLES.map(r => {
            const isActive = activeRole.id === r.id;
            return (
              <div 
                key={r.id}
                onClick={() => setActiveRole(r)}
                style={{ 
                  padding: '20px', 
                  background: isActive ? '#fef2f2' : 'white', 
                  border: `1px solid ${isActive ? '#fecaca' : 'var(--color-border)'}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 6px -1px rgba(220, 38, 38, 0.05)' : 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{r.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{r.users} Users</div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  {r.desc}
                </div>
              </div>
            );
          })}
          
          <button className="btn" style={{ background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '16px', borderRadius: '16px', marginTop: '8px' }}>
            + Add New Role
          </button>
        </div>

        {/* Right Column - Permissions */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Permissions for {activeRole.name}</h2>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{activeRole.desc}</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              <input type="checkbox" checked={true} readOnly />
              Select All
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Catalog */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: '16px' }}>Catalog</div>
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={true} readOnly /> View Products
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={true} readOnly /> Edit Details
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={true} readOnly /> Edit Price
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={true} readOnly /> Edit Stock
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={true} readOnly /> Delete Products
                </label>
              </div>
            </div>

            {/* Sales & Orders */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: '16px' }}>Sales & Orders</div>
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={true} readOnly /> View Orders
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={true} readOnly /> View Financials
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={true} readOnly /> Update Status
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={true} readOnly /> Cancel Orders
                </label>
              </div>
            </div>

            {/* Customers & Wholesale */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: '16px' }}>Customers & Wholesale</div>
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={true} readOnly /> View Customers
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={true} readOnly /> View Wholesale
                </label>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
