import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useOrderStore } from '../store/orderStore';
import { Card, Badge, Button, Select, Modal, Pagination, Empty, Spinner } from '../components/UI';

const STATUS_OPTIONS = [
  { value: 'pending',   label: '⏳ Pending'   },
  { value: 'confirmed', label: '✅ Confirmed' },
  { value: 'shipped',   label: '🚚 Shipped'   },
  { value: 'delivered', label: '🎉 Delivered' },
];

function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  const [status, setStatus] = useState(order?.status || 'pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (order) setStatus(order.status); }, [order]);

  const handleUpdate = async () => {
    setSaving(true);
    const res = await onStatusUpdate(order._id, status);
    setSaving(false);
    if (res.success) {
      toast.success(`Status updated to ${status} — user notified via WebSocket 🔔`);
      onClose();
    } else {
      toast.error(res.message);
    }
  };

  if (!order) return null;

  return (
    <Modal open={!!order} onClose={onClose} title={`Order #${order._id.slice(-8).toUpperCase()}`} width={580}>
      {/* Customer Info */}
      <div style={{ marginBottom: '20px', padding: '14px', background: 'var(--bg3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '8px' }}>Customer</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{order.user?.name || 'Unknown'}</div>
            <div style={{ color: 'var(--text3)', fontSize: '12px' }}>{order.user?.email}</div>
          </div>
          <Badge label={order.status} type={order.status} />
        </div>
      </div>

      {/* Items */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '10px' }}>Items</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {order.items.map((item) => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
              <span style={{ fontWeight: 500 }}>{item.name}</span>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--text2)' }}>
                <span>×{item.quantity}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--accent)' }}>
            Total: ₹{order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Status History */}
      {order.statusHistory?.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '10px' }}>History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {order.statusHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 12px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)' }}>
                <Badge label={h.status} type={h.status} />
                <span style={{ color: 'var(--text3)' }}>{new Date(h.updatedAt).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Status */}
      <div style={{ padding: '16px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 'var(--radius)', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <Select
            label="Update Status (notifies user in real-time)"
            value={status}
            options={STATUS_OPTIONS}
            onChange={e => setStatus(e.target.value)}
          />
        </div>
        <Button onClick={handleUpdate} loading={saving} disabled={status === order.status} variant="green">
          Send Update
        </Button>
      </div>

      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text3)' }}>
        <Badge label="Live" type="live" />
        <span>The user will receive a real-time notification via Socket.io</span>
      </div>
    </Modal>
  );
}

export default function AdminOrdersPage() {
  const { orders, meta, isLoading, filters, setFilters, setPage, fetchOrders, updateOrderStatus } = useOrderStore();
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (id, status) => {
    const res = await updateOrderStatus(id, status);
    return res;
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>All Orders</h1>
            <Badge label="Live" type="live" />
          </div>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>{meta?.total || 0} orders · Updates push to users via WebSocket</p>
        </div>
        <Select value={filters.status}
          options={[{ value: '', label: 'All Statuses' }, ...STATUS_OPTIONS]}
          onChange={e => setFilters({ status: e.target.value })}
        />
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {STATUS_OPTIONS.map(({ value, label }) => {
          const count = orders.filter(o => o.status === value).length;
          return (
            <Card key={value} style={{ padding: '16px', cursor: 'pointer', border: filters.status === value ? '1px solid var(--accent)' : '1px solid var(--border)' }}
              onClick={() => setFilters({ status: filters.status === value ? '' : value })}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>{label.split(' ')[0]}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>{count}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'capitalize' }}>{value}</div>
            </Card>
          );
        })}
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div style={{ display: 'grid', placeItems: 'center', padding: '60px' }}>
          <Spinner size={32} color="var(--accent)" />
        </div>
      ) : orders.length === 0 ? (
        <Empty icon="📋" title="No orders found" subtitle="Orders will appear here once placed" />
      ) : (
        <>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order._id}
                    style={{ borderBottom: i < orders.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--text2)' }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{order.user?.name || '—'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{order.user?.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text2)' }}>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)', fontSize: '14px' }}>
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge label={order.status} type={order.status} />
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text3)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Button size="sm" variant="secondary" onClick={() => setSelected(order)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pagination meta={meta} onPage={setPage} />
        </>
      )}

      {/* Detail / Status Update Modal */}
      <OrderDetailModal
        order={selected}
        onClose={() => setSelected(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
