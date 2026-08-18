'use client';

import { useState, useEffect } from 'react';
import { getPermissions, updatePermission } from '@/app/actions';

export default function RolesPage() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  async function fetchPermissions() {
    setLoading(true);
    const { data, error } = await getPermissions();
    if (!error && data) {
      setPermissions(data);
    }
    setLoading(false);
  }

  async function togglePermission(id: string, field: string, currentValue: boolean) {
    setSaving(id);
    
    // Optimistic update in UI
    setPermissions(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: !currentValue } : p
    ));

    // Send to DB
    const { error } = await updatePermission(id, { [field]: !currentValue });
    if (error) {
      const { showAlert } = await import('@/app/utils/swal');
      showAlert("Error", "Failed to update permission: " + error.message, "error");
      // Revert if error (lazy reload)
      fetchPermissions();
    }
    setSaving(null);
  }

  // Define the columns/permissions we want to display
  const permissionFields = [
    { key: 'can_view_orders', label: 'View Orders' },
    { key: 'can_edit_orders', label: 'Edit Orders' },
    { key: 'can_view_products', label: 'View Products' },
    { key: 'can_edit_products', label: 'Edit Products' },
    { key: 'can_manage_discounts', label: 'Discounts' },
    { key: 'can_manage_staff', label: 'Manage Staff' },
    { key: 'can_handle_tickets', label: 'Support Tickets' }
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Roles & Permissions</h1>
          <div className="breadcrumb">Dashboard &gt; Roles & Permissions</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)' }}>Global Role Assignments</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Toggle features on or off for the standard system roles. Changes take effect instantly for all active sessions.
          </p>
        </div>

        <div className="table-wrapper" style={{ border: 'none' }}>
          <table style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{ width: '200px' }}>SYSTEM ROLE</th>
                {permissionFields.map(field => (
                  <th key={field.key} style={{ textAlign: 'center' }}>{field.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={permissionFields.length + 1} style={{ textAlign: 'center', padding: '40px' }}>Loading permissions...</td></tr>
              ) : permissions.length === 0 ? (
                <tr><td colSpan={permissionFields.length + 1} style={{ textAlign: 'center', padding: '40px' }}>No roles defined in the database.</td></tr>
              ) : permissions.map(role => {
                const isSuperAdmin = role.role === 'platform_super_admin';
                return (
                  <tr key={role.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)', textTransform: 'capitalize' }}>
                        {role.role.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {isSuperAdmin ? 'Full system access (locked)' : 'Customizable'}
                      </div>
                    </td>
                    {permissionFields.map(field => (
                      <td key={field.key} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <label style={{ 
                            position: 'relative', 
                            display: 'inline-block', 
                            width: '40px', 
                            height: '24px',
                            cursor: isSuperAdmin ? 'not-allowed' : (saving === role.id ? 'wait' : 'pointer'),
                            opacity: isSuperAdmin ? 0.5 : 1
                          }}>
                            <input 
                              type="checkbox" 
                              checked={role[field.key]} 
                              disabled={isSuperAdmin || saving === role.id}
                              onChange={() => togglePermission(role.id, field.key, role[field.key])}
                              style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                              position: 'absolute',
                              cursor: isSuperAdmin ? 'not-allowed' : 'pointer',
                              top: 0, left: 0, right: 0, bottom: 0,
                              backgroundColor: role[field.key] ? 'var(--color-primary)' : 'var(--color-border)',
                              transition: '.4s',
                              borderRadius: '24px'
                            }}>
                              <span style={{
                                position: 'absolute',
                                content: '""',
                                height: '18px',
                                width: '18px',
                                left: '3px',
                                bottom: '3px',
                                backgroundColor: 'white',
                                transition: '.4s',
                                borderRadius: '50%',
                                transform: role[field.key] ? 'translateX(16px)' : 'translateX(0)'
                              }} />
                            </span>
                          </label>
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
