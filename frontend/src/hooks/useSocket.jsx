import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import { useNotificationStore } from '../store/notificationStore';
import { connectSocket, disconnectSocket, getSocket } from '../utils/socket';

const STATUS_COLORS = {
  pending:   '#FFB800',
  confirmed: '#00D4FF',
  shipped:   '#9B59FF',
  delivered: '#00FF87',
};

const STATUS_ICONS = {
  pending:   '⏳',
  confirmed: '✅',
  shipped:   '🚚',
  delivered: '🎉',
};

export const useSocket = () => {
  const { user, accessToken } = useAuthStore();
  const { realtimeUpdateStatus } = useOrderStore();
  const { add } = useNotificationStore();
  const bound = useRef(false);

  useEffect(() => {
    if (!accessToken || !user) return;

    const socket = connectSocket(accessToken);

    if (bound.current) return;
    bound.current = true;

    socket.on('order:statusUpdated', (payload) => {
      const { orderId, newStatus, message } = payload;

      // Update store in real time
      realtimeUpdateStatus(orderId, newStatus);

      // Add to notification history
      add({ type: 'order', orderId, status: newStatus, message });

      // Show toast
      toast.custom(
        (t) => (
          <div
            style={{
              background: '#0D1117',
              border: `1px solid ${STATUS_COLORS[newStatus] || '#1E2A38'}`,
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              boxShadow: `0 0 24px ${STATUS_COLORS[newStatus]}22`,
              minWidth: '280px',
              animation: t.visible ? 'slideIn 0.35s ease' : 'fadeIn 0.2s ease',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span style={{ fontSize: '22px' }}>{STATUS_ICONS[newStatus] || '📦'}</span>
            <div>
              <div style={{ color: STATUS_COLORS[newStatus], fontWeight: 700, fontSize: '13px', marginBottom: '3px' }}>
                Order {newStatus.toUpperCase()}
              </div>
              <div style={{ color: '#7A8FA6', fontSize: '12px' }}>{message}</div>
            </div>
          </div>
        ),
        { duration: 6000, position: 'top-right' }
      );
    });

    return () => {
      socket?.off('order:statusUpdated');
      bound.current = false;
    };
  }, [accessToken, user]);
};
