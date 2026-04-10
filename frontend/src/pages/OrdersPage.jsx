import { useEffect } from 'react';
import { useOrderStore } from '../store/orderStore';
import { Card, Badge, Select, Pagination, Empty, Spinner } from '../components/UI';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];
const STATUS_ICONS = { pending: '⏳', confirmed: '✅', shipped: '🚚', delivered: '🎉' };

function OrderStatusBar({ status }) {
  const current = STATUS_STEPS.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: '12px' }}>
      {STATUS_STEPS.map((step, i) => {
        const done    = i <= current;
        const active  = i === current;
        const color   = done ? 'var(--green)' : 'var(--border)';
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? 'rgba(0,255,135,0.15)' : 'var(--bg3)',
                border: `2px solid ${color}`,
                display: 'grid', placeItems: 'center', fontSize: '12px',
                boxShadow: active ? 'var(--glow-green)' : 'none',
                transition: 'all 0.3s',
              }}>
                {done ? (active ? STATUS_ICONS[step] : '✓') : '○'}
              </div>
              <span style={{ fontSize: '9px', color: done ? 'var(--green)' : 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < current ? 'var(--green)' : 'var(--border)', marginBottom: '18px', transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <Card style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
            ORDER #{order._id.slice(-8).toUpperCase()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Badge label={order.status} type={order.status} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--accent)' }}>
            ₹{order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
        {order.items.map((item) => (
          <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
            <span style={{ color: 'var(--text)' }}>{item.name}</span>
            <span style={{ color: 'var(--text2)' }}>×{item.quantity} · <span style={{ color: 'var(--text)' }}>₹{(item.price * item.quantity).toLocaleString()}</span></span>
          </div>
        ))}
      </div>

      {/* Status Progress Bar */}
      <OrderStatusBar status={order.status} />
    </Card>
  );
}

export default function OrdersPage() {
  const { orders, meta, isLoading, filters, setFilters, setPage, fetchOrders } = useOrderStore();

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>My Orders</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>{meta?.total || 0} orders total</p>
        </div>

        <Select value={filters.status} options={[
          { value: '', label: 'All Statuses' },
          { value: 'pending',   label: 'Pending'   },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'shipped',   label: 'Shipped'   },
          { value: 'delivered', label: 'Delivered' },
        ]} onChange={e => setFilters({ status: e.target.value })} />
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', placeItems: 'center', padding: '60px' }}><Spinner size={32} color="var(--accent)" /></div>
      ) : orders.length === 0 ? (
        <Empty icon="📦" title="No orders yet" subtitle="Add items to your cart and place an order from the shop" />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map((o) => <OrderCard key={o._id} order={o} />)}
          </div>
          <Pagination meta={meta} onPage={setPage} />
        </>
      )}
    </div>
  );
}
