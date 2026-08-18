'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthSession, logoutAction, changePassword } from '@/app/actions';
import { showToast } from '@/app/utils/swal';

const MENU = [
  { section: null, items: [
    { label: 'Overview', href: '/dashboard', icon: '⊞' },
  ]},
  { section: 'Sales & Orders', items: [
    { label: 'Orders', href: '/dashboard/orders', icon: '📦' },
  ]},
  { section: 'Catalog', items: [
    { label: 'Products', href: '/dashboard/products', icon: '👕' },
    { label: 'Discount Rules', href: '/dashboard/discounts', icon: '🏷️' },
  ]},
  { section: 'Support', items: [
    { label: 'Tickets', href: '/dashboard/tickets', icon: '🎫' },
  ]},
  { section: 'Staff & Permissions', items: [
    { label: 'Staff', href: '/dashboard/staff', icon: '👥' },
    { label: 'Roles & Permissions', href: '/dashboard/roles', icon: '🛡️' }
  ]}
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; business: string; permissions?: any } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const session = await getAuthSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session);
    }
    loadSession();
  }, [router]);

  async function handleLogout() {
    await logoutAction();
    showToast('Logged out successfully', 'info');
    router.push('/');
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newPwd) return;
    setIsUpdating(true);
    // Very basic hash for MVP
    const hash = Buffer.from(newPwd).toString('base64');
    const { error } = await changePassword(user!.id, hash);
    setIsUpdating(false);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Password updated successfully!', 'success');
      setShowPwdModal(false);
      setNewPwd('');
    }
  }

  return (
    <div className="layout">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo-area">
          <div className="sidebar-logo-icon">M</div>
          <div>
            <div className="sidebar-logo-text">MY MOON</div>
            <div className="sidebar-logo-sub">Fashion Gallery</div>
          </div>
        </div>

        <div className="no-scrollbar" style={{ flex: 1, paddingTop: '16px', overflowY: 'auto', paddingBottom: '16px' }}>
          {MENU.map(group => {
            const items = group.items.filter(item => {
              if (!user || !user.permissions) return true; // Super admin or loading
              const p = user.permissions;
              if (item.label === 'Orders' && !p.can_view_orders) return false;
              if (item.label === 'Products' && !p.can_view_products) return false;
              if (item.label === 'Discount Rules' && !p.can_manage_discounts) return false;
              if (item.label === 'Staff' && !p.can_manage_staff) return false;
              if (item.label === 'Roles & Permissions' && !p.can_manage_staff) return false;
              if (item.label === 'Tickets' && !p.can_handle_tickets) return false;
              return true;
            });
            return { ...group, items };
          }).filter(g => g.items.length > 0).map((group, idx) => (
            <div key={idx} style={{ marginBottom: '4px' }}>
              {group.section && <div className="nav-section">{group.section}</div>}
              {group.items.map(item => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`nav-item ${isActive ? 'active' : ''}`}>
                      <span className="nav-item-icon">{item.icon}</span>
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ padding: '24px 0 16px 0', borderTop: '1px solid #334155' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: 'none', 
              color: '#94a3b8', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '10px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.2s, color 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#334155'; }}
            onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: '18px' }}>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────────────────────────────── */}
      <div className="main-wrapper">
        <header className="topbar">
          <button className="topbar-btn" onClick={() => window.open('https://web.whatsapp.com/', '_blank')}>
             <span style={{ color: 'var(--color-primary)' }}>💬</span> Live Chat
          </button>
          
          <div 
            className="topbar-profile" 
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="profile-info" style={{ textAlign: 'right' }}>
              <span className="profile-name">{user?.name || 'Super Admin'}</span>
              <span className="profile-role">Owner</span>
            </div>
            <div className="profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>▼</span>
            
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '8px',
                minWidth: '160px',
                zIndex: 100
              }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); setShowPwdModal(true); }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-main)' }}
                  onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  🔒 Change Password
                </button>
              </div>
            )}
          </div>
        </header>
        
        <main className="main-content">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ─────────────────────────────────────── */}
      <nav className="mobile-bottom-nav">
        {[
          { label: 'Overview', href: '/dashboard', icon: '⊞' },
          { label: 'Orders', href: '/dashboard/orders', icon: '📦' },
          { label: 'Tickets', href: '/dashboard/tickets', icon: '🎫' },
        ].map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
              <span className="mobile-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <button onClick={() => setShowMobileMenu(true)} className="mobile-nav-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="mobile-nav-icon">☰</span>
          MENU
        </button>
      </nav>

      {/* ── Mobile Menu Drawer ─────────────────────────────────────────── */}
      {showMobileMenu && (
        <div onClick={() => setShowMobileMenu(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 9999,
          backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px',
            animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
            maxHeight: '85vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)' }}>Menu</h3>
              <button onClick={() => setShowMobileMenu(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '20px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MENU.flatMap(g => g.items).filter(item => {
                if (!user || !user.permissions) return true;
                const p = user.permissions;
                if (item.label === 'Orders' && !p.can_view_orders) return false;
                if (item.label === 'Products' && !p.can_view_products) return false;
                if (item.label === 'Discount Rules' && !p.can_manage_discounts) return false;
                if (item.label === 'Staff' && !p.can_manage_staff) return false;
                if (item.label === 'Roles & Permissions' && !p.can_manage_staff) return false;
                if (item.label === 'Tickets' && !p.can_handle_tickets) return false;
                return true;
              }).map(item => (
                <Link key={item.href} href={item.href} onClick={() => setShowMobileMenu(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                  background: pathname === item.href ? 'var(--color-primary-light)' : '#f8fafc',
                  color: pathname === item.href ? 'var(--color-primary)' : 'var(--color-text-main)',
                  borderRadius: '12px', fontWeight: 600, fontSize: '15px'
                }}>
                  <span style={{ fontSize: '20px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              <div style={{ height: '1px', background: 'var(--color-border)', margin: '12px 0' }} />
              
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                background: '#fef2f2', color: '#dc2626', borderRadius: '12px', fontWeight: 600, fontSize: '15px', border: 'none', cursor: 'pointer', width: '100%'
              }}>
                <span style={{ fontSize: '20px', width: '24px', textAlign: 'center' }}>🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPwdModal && (
        <div className="modal-overlay" onClick={() => setShowPwdModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '32px' }}>
            <h2 className="modal-title" style={{ marginBottom: '4px' }}>Change Password</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              Update your account password securely.
            </p>
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPwdModal(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
