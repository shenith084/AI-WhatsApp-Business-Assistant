'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '@/app/actions';
import { showAlert, showToast } from '@/app/utils/swal';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    businessName: '',
    adminPhone: '',
    wahaSession: ''
  });

  const businessId = process.env.NEXT_PUBLIC_PILOT_BUSINESS_ID || '11111111-1111-1111-1111-111111111111';

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await getSettings(businessId);
        if (!error && data) {
          setFormData({
            businessName: data.business_name || '',
            adminPhone: data.admin_phone || '',
            wahaSession: data.waha_session || ''
          });
        }
      } catch (err) {
        console.error(err);
      }
      setInitialLoading(false);
    }
    fetchSettings();
  }, [businessId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    // Save to Supabase using Server Action
    try {
      const { error } = await updateSettings(businessId, {
        business_name: formData.businessName,
        admin_phone: formData.adminPhone,
        waha_session: formData.wahaSession
      });
      
      setLoading(false);
      
      if (!error) {
        setSuccess(true);
        showToast("Settings saved successfully!");
        setTimeout(() => setSuccess(false), 3000);
      } else {
        showAlert("Error saving settings", JSON.stringify(error));
      }
    } catch (err: any) {
      setLoading(false);
      showAlert("Error saving settings", err.message);
    }
  };

  if (initialLoading) {
    return <div style={{ padding: '40px' }}>Loading settings from database...</div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <div className="breadcrumb">Dashboard &gt; Settings</div>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: 'var(--color-text-main)' }}>WhatsApp Integration Settings</h2>
          
          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ color: 'var(--color-text-muted)' }}>Business Name</label>
              <input 
                type="text" 
                name="businessName"
                className="form-input" 
                value={formData.businessName}
                onChange={handleChange}
                style={{ maxWidth: '400px' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>This name will be displayed in the sidebar.</div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ color: 'var(--color-text-muted)' }}>Admin Notification Phone Number</label>
              <input 
                type="text" 
                name="adminPhone"
                className="form-input" 
                value={formData.adminPhone}
                onChange={handleChange}
                style={{ maxWidth: '400px' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>The AI Assistant will route unhandled queries and support tickets to this WhatsApp number. (Include country code, no +)</div>
            </div>

            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label" style={{ color: 'var(--color-text-muted)' }}>WAHA Session ID</label>
              <input 
                type="text" 
                name="wahaSession"
                className="form-input" 
                value={formData.wahaSession}
                onChange={handleChange}
                style={{ maxWidth: '400px', backgroundColor: '#f8fafc' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>The active session ID connected to your WhatsApp bot.</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving to Database...' : 'Save Changes'}
              </button>
              
              {success && (
                <span style={{ color: 'var(--color-success-text)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: 'var(--color-success-bg)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                  Settings saved successfully to database!
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
