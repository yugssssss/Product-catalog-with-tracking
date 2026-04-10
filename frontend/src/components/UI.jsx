// ─── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', fontFamily: 'var(--font-body)', fontWeight: 600,
    borderRadius: 'var(--radius)', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s', border: 'none', whiteSpace: 'nowrap',
    opacity: disabled || loading ? 0.5 : 1,
  };
  const sizes = {
    sm: { padding: '6px 14px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '15px' },
  };
  const variants = {
    primary: { background: 'var(--accent)', color: '#080B10' },
    secondary: { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' },
    danger: { background: 'rgba(255,59,92,0.15)', color: 'var(--red)', border: '1px solid rgba(255,59,92,0.3)' },
    ghost: { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)' },
    green: { background: 'var(--green)', color: '#080B10' },
  };
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant] }} disabled={disabled || loading} {...props}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, icon, className = '', ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', display: 'flex' }}>{icon}</span>}
        <input
          style={{
            width: '100%', padding: icon ? '10px 12px 10px 38px' : '10px 14px',
            background: 'var(--bg3)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

// ─── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, options = [], ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</label>}
      <select
        style={{
          width: '100%', padding: '10px 14px',
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px',
          appearance: 'none', cursor: 'pointer',
        }}
        {...props}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, hover = false, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px',
        transition: hover ? 'all 0.2s' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.borderColor = 'var(--border2)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  pending:   { bg: 'rgba(255,184,0,0.12)',   color: '#FFB800',  border: 'rgba(255,184,0,0.3)'   },
  confirmed: { bg: 'rgba(0,212,255,0.12)',   color: '#00D4FF',  border: 'rgba(0,212,255,0.3)'   },
  shipped:   { bg: 'rgba(155,89,255,0.12)',  color: '#9B59FF',  border: 'rgba(155,89,255,0.3)'  },
  delivered: { bg: 'rgba(0,255,135,0.12)',   color: '#00FF87',  border: 'rgba(0,255,135,0.3)'   },
  admin:     { bg: 'rgba(255,107,53,0.12)',  color: '#FF6B35',  border: 'rgba(255,107,53,0.3)'  },
  user:      { bg: 'rgba(0,212,255,0.08)',   color: '#00D4FF',  border: 'rgba(0,212,255,0.2)'   },
  cached:    { bg: 'rgba(0,255,135,0.08)',   color: '#00FF87',  border: 'rgba(0,255,135,0.2)'   },
  live:      { bg: 'rgba(0,255,135,0.12)',   color: '#00FF87',  border: 'rgba(0,255,135,0.3)'   },
};

export function Badge({ label, type = 'user' }) {
  const s = BADGE_STYLES[type] || BADGE_STYLES.user;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px', fontSize: '11px',
      fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {type === 'live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', animation: 'pulse-ring 1.5s infinite' }} />}
      {label}
    </span>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(8,11,16,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: width,
        maxHeight: '90vh', overflowY: 'auto', animation: 'fadeUp 0.3s ease',
      }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: '20px', lineHeight: 1, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '28px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
export function Empty({ icon = '📭', title = 'Nothing here', subtitle = '' }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{title}</div>
      {subtitle && <div style={{ color: 'var(--text2)', fontSize: '14px' }}>{subtitle}</div>}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 180 }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="skeleton" style={{ height: 18, width: '70%' }} />
        <div className="skeleton" style={{ height: 14, width: '90%' }} />
        <div className="skeleton" style={{ height: 14, width: '50%' }} />
      </div>
    </div>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ meta, onPage }) {
  if (!meta || meta.totalPages <= 1) return null;
  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1);

  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', marginTop: '32px' }}>
      <button onClick={() => onPage(meta.page - 1)} disabled={!meta.hasPrevPage}
        style={{ padding: '8px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: meta.hasPrevPage ? 'var(--text)' : 'var(--text3)', cursor: meta.hasPrevPage ? 'pointer' : 'not-allowed' }}>
        ←
      </button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <>
            {prev && p - prev > 1 && <span key={`gap-${p}`} style={{ color: 'var(--text3)', padding: '0 4px' }}>…</span>}
            <button key={p} onClick={() => onPage(p)}
              style={{ padding: '8px 14px', background: p === meta.page ? 'var(--accent)' : 'var(--bg3)', border: `1px solid ${p === meta.page ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', color: p === meta.page ? '#080B10' : 'var(--text)', fontWeight: p === meta.page ? 700 : 400, cursor: 'pointer' }}>
              {p}
            </button>
          </>
        );
      })}
      <button onClick={() => onPage(meta.page + 1)} disabled={!meta.hasNextPage}
        style={{ padding: '8px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: meta.hasNextPage ? 'var(--text)' : 'var(--text3)', cursor: meta.hasNextPage ? 'pointer' : 'not-allowed' }}>
        →
      </button>
    </div>
  );
}
