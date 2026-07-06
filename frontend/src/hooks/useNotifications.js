import { useEffect, useRef } from 'react';
import { useNotificationContext } from '../context/NotificationContext';

function playSound() {
  try {
    const muted = localStorage.getItem('notif_muted') === 'true';
    if (muted) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    /* audio not supported — silently skip */
  }
}

function updateTabBadge(unreadCount) {
  if (document.hasFocus()) return;
  const prefix = unreadCount > 0 ? `(${unreadCount}) ` : '';
  document.title = prefix + 'TyDee Tasks';
}

function clearTabBadge() {
  document.title = 'TyDee Tasks';
}

export function useNotifications(onNotification) {
  const sentRef = useRef(new Set());
  const { addNotification, unreadCount } = useNotificationContext();
  const prevCount = useRef(0);

  useEffect(() => {
    const onFocus = () => clearTabBadge();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    if (unreadCount > prevCount.current) {
      updateTabBadge(unreadCount);
    }
    if (unreadCount === 0) clearTabBadge();
    prevCount.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const es = new EventSource(`/api/notifications/stream?token=${token}`);

    es.addEventListener('notification', (e) => {
      const data = JSON.parse(e.data);
      const key = `${data.taskId}:${data.type}`;
      if (sentRef.current.has(key)) return;
      sentRef.current.add(key);

      addNotification(data);

      playSound();

      if (!document.hasFocus()) {
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('TyDee Tasks', {
            body: data.message,
            icon: '/favicon.ico',
          });
        }
      }

      onNotification?.(data);
    });

    es.onerror = () => {
      es.close();
    };

    return () => es.close();
  }, [onNotification, addNotification]);
}
