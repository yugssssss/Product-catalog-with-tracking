import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Badge } from './UI';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { notifications, clear } = useNotificationStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const unread = notifications.length;

  const links = [
    { to: '/', label: 'Shop' },
    { to: '/orders', label: 'My Orders' },
    ...(user?.role === 'admin' ? [
      { to: '/admin/products', label: 'Products' },
      { to: '/admin/orders', label: 'Orders' },
    ] : []),
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8,11,16,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: '16px' }}>📦</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--text)' }}>ShopFlow</span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {links.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 500,
                color: location.pathname === to ? 'var(--accent)' : 'var(--text2)',
                background: location.pathname === to ? 'rgba(0,212,255,0.08)' : 'transparent',
                transition: 'all 0.2s',
              }}>
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              {/* Notifications Bell */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowNotifs(!showNotifs)}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text)', position: 'relative', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  🔔
                  {unread > 0 && (
                    <span style={{ background: 'var(--red)', color: '#fff', borderRadius: '999px', fontSize: '10px', fontWeight: 700, padding: '1px 6px' }}>{unread}</span>
                  )}
                </button>

                {showNotifs && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 8,
                    width: 320, background: 'var(--bg2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)',
                    animation: 'fadeUp 0.2s ease', zIndex: 200, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                      {unread > 0 && <button onClick={() => { clear(); setShowNotifs(false); }} style={{ background: 'none', color: 'var(--text3)', fontSize: '12px', cursor: 'pointer' }}>Clear all</button>}
                    </div>
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{n.message}</div>
                            <div style={{ color: 'var(--text3)', fontSize: '11px' }}>{new Date(n.createdAt).toLocaleTimeString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center', fontSize: '11px', color: '#080B10', fontWeight: 700 }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                <Badge label={user.role} type={user.role} />
              </div>

              <button onClick={handleLogout} style={{ background: 'none', color: 'var(--text3)', fontSize: '13px', cursor: 'pointer', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px', color: 'var(--text2)', border: '1px solid var(--border)' }}>Login</Link>
              <Link to="/register" style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--accent)', color: '#080B10', fontWeight: 700 }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
