'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Overview',          href: '/dashboard',              icon: '⚡', section: 'main' },
  { label: 'Products',          href: '/dashboard/products',     icon: '👕', section: 'main' },
  { label: 'Discount Rules',    href: '/dashboard/discounts',    icon: '🏷️', section: 'main' },
  { label: 'Orders',            href: '/dashboard/orders',       icon: '📦', section: 'main' },
  { label: 'Support Tickets',   href: '/dashboard/tickets',      icon: '🎫', section: 'support', badge: true },
  { label: 'Conversations',     href: '/dashboard/conversations',icon: '💬', section: 'support' },
  { label: 'Customers',         href: '/dashboard/customers',    icon: '👥', section: 'support' },
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

  function handleLogout() {
    localStorage.removeItem('waba_auth');
    router.push('/');
  }

  const mainNav    = NAV_ITEMS.filter(i => i.section === 'main');
  const supportNav = NAV_ITEMS.filter(i => i.section === 'support');

  return (
    <div className="layout">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💬</div>
          <div>
            <div className="sidebar-logo-text">{user?.business ?? 'Loading…'}</div>
            <div className="sidebar-logo-sub">WA Business Assistant</div>
          </div>
        </div>

        {/* WAHA Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 12px',
          background: 'rgba(34,197,94,0.06)',
          borderRadius: '10px',
          border: '1px solid rgba(34,197,94,0.15)',
          marginBottom: '8px'
        }}>
          <span className="status-dot online" />
          <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 500 }}>
            WhatsApp Connected
          </span>
        </div>

        <span className="sidebar-section-label">Main</span>
        {mainNav.map(item => (
          <Link key={item.href} href={item.href}>
            <div className={`nav-item ${pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)) ? 'active' : ''}`}>
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </div>
          </Link>
        ))}

        <span className="sidebar-section-label">Support</span>
        {supportNav.map(item => (
          <Link key={item.href} href={item.href}>
            <div className={`nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}>
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="nav-item-badge">3</span>}
            </div>
          </Link>
        ))}

        {/* Sidebar footer */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', color: '#fff', fontWeight: 700, flexShrink: 0
            }}>
              {user?.name?.[0] ?? 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Business Owner</div>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: '10px',
              background: 'transparent', border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)', fontSize: '13px', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
