import { useEffect, useRef } from 'react';
import { useNotificationContext } from '../context/NotificationContext';

export function useNotifications(onNotification) {
  const sentRef = useRef(new Set());
  const { addNotification } = useNotificationContext();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const es = new EventSource(`/api/notifications/stream?token=${token}`);

    es.addEventListener('notification', (e) => {
      const data = JSON.parse(e.data);
      const key = `${data.taskId}:${data.type}`;
      if (sentRef.current.has(key)) return;
      sentRef.current.add(key);

      addNotification(data);

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('TyDee Tasks', {
          body: data.message,
          icon: '/favicon.ico',
        });
      }

      onNotification?.(data);
    });

    es.onerror = () => {
      es.close();
      setTimeout(() => {}, 5000);
    };

    return () => es.close();
  }, [onNotification, addNotification]);
}
