import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { LogOut, CheckCircle, Menu, X, Bell, Clock, AlertTriangle, Trash2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, isOpen, setIsOpen, markAsRead, markAllRead, clearAll } = useNotificationContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const getIcon = (type) => {
    switch (type) {
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending_reminder': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTime = (id) => {
    const diff = Date.now() - id;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-blue-600 w-6 h-6" />
          <span className="text-xl font-bold text-gray-800">TyDee Tasks</span>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                    )}
                    {notifications.length > 0 && (
                      <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${!n.read ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          {getIcon(n.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatTime(n.id)}</p>
                          </div>
                          {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600">
            Hello, <span className="font-semibold">{user?.username}</span>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 mt-3 pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-gray-600">
              Hello, <span className="font-semibold">{user?.username}</span>
            </span>
            <div className="relative">
              <button onClick={() => setIsOpen(!isOpen)} className="relative p-2">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
