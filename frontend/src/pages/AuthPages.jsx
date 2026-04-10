import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Button, Input } from '../components/UI';

function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: 56, height: 56, background: 'var(--accent)', borderRadius: 16, display: 'inline-grid', placeItems: 'center', fontSize: '26px', marginBottom: '16px' }}>📦</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>{title}</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>{subtitle}</p>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your ShopFlow account">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        <Button type="submit" size="lg" loading={isLoading} style={{ width: '100%', marginTop: '4px' }}>
          Sign In
        </Button>
      </form>

      {/* Quick demo logins */}
      <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '10px' }}>Quick fill</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setForm({ email: 'admin@demo.com', password: 'admin123' })}
            style={{ flex: 1, padding: '8px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 'var(--radius-sm)', color: '#FF6B35', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            Admin Demo
          </button>
          <button onClick={() => setForm({ email: 'user@demo.com', password: 'user1234' })}
            style={{ flex: 1, padding: '8px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 'var(--radius-sm)', color: '#00D4FF', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            User Demo
          </button>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text3)' }}>
        No account?{' '}
        <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one</Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const res = await register(form.name, form.email, form.password);
    if (res.success) {
      toast.success('Account created!');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join ShopFlow today">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Input label="Name" placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <Input label="Password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        <Button type="submit" size="lg" loading={isLoading} style={{ width: '100%', marginTop: '4px' }}>
          Create Account
        </Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text3)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}
