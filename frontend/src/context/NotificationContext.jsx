import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { api } from '../api/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.notifications.getAll()
      .then(res => {
        setNotifications(res.data.map(n => ({ ...n, id: n.id })));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const addNotification = useCallback((data) => {
    setNotifications(prev => {
      const exists = prev.some(n => n.task_id === data.task_id && n.type === data.type);
      if (exists) return prev;
      return [{ ...data }, ...prev].slice(0, 100);
    });
  }, []);

  const markAsRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
    api.notifications.markRead(id).catch(() => {});
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
    api.notifications.markAllRead().catch(() => {});
  }, []);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    api.notifications.clearAll().catch(() => {});
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isOpen,
      setIsOpen,
      addNotification,
      markAsRead,
      markAllRead,
      clearAll,
      loaded,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
