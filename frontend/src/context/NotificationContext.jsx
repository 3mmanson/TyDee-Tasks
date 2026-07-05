import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addNotification = useCallback((data) => {
    setNotifications(prev => {
      const exists = prev.some(n => n.taskId === data.taskId && n.type === data.type);
      if (exists) return prev;
      return [{ ...data, id: Date.now(), read: false }, ...prev].slice(0, 50);
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
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
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
