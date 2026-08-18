'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
  { section: 'Staff & Permissions', items: [
    { label: 'Staff', href: '/dashboard/staff', icon: '👥' },
  ]}
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser] = useState<{ name: string; business: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('waba_auth');
    if (!stored) { router.push('/'); return; }
    setUser(JSON.parse(stored));
  }, [router]);

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

        <div style={{ flex: 1, paddingTop: '16px' }}>
          {MENU.map((group, idx) => (
            <div key={idx} style={{ marginBottom: '12px' }}>
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
        
        {/* Bottom User Area inside Sidebar */}
        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
           <div className="profile-avatar" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
             {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
           </div>
           <div style={{ flex: 1, overflow: 'hidden' }}>
             <div style={{ color: 'white', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
               {user?.name || 'Admin'}
             </div>
             <div style={{ color: 'var(--color-text-sidebar)', fontSize: '11px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
               {user?.business || 'Fashion Gallery'}
             </div>
           </div>
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────────────────────────────── */}
      <div className="main-wrapper">
        <header className="topbar">
          <button className="topbar-btn">
             <span style={{ color: 'var(--color-primary)' }}>💬</span> Live Chat
          </button>
          
          <div className="topbar-profile">
            <div className="profile-info" style={{ textAlign: 'right' }}>
              <span className="profile-name">{user?.name || 'Super Admin'}</span>
              <span className="profile-role">Owner</span>
            </div>
            <div className="profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>▼</span>
          </div>
        </header>
        
        <main className="main-content">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
